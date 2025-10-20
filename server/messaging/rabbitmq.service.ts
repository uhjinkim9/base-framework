import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {
  ChannelWrapper,
  AmqpConnectionManager,
  connect,
} from "amqp-connection-manager";
import {ConfirmChannel, ConsumeMessage} from "amqplib";

import {RABBITMQ_DEFAULT_EXCHANGE} from "./rabbitmq.constants";

// amqplib에는 두 가지 주요 타입이 있어요:
// Connection : 브로커와의 연결 (소켓 단위)
// Channel / ConfirmChannel : 실제 메시지를 publish/consume 하는 통로

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private connection?: AmqpConnectionManager;
  private channel?: ChannelWrapper;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url = this.configService.get<string>("RABBITMQ_URL");

    if (!url) {
      this.logger.warn(
        "RABBITMQ_URL is not defined. RabbitMQ features are disabled.",
      );
      return;
    }

    this.connection = connect([url], {
      heartbeatIntervalInSeconds: this.configService.get<number>(
        "RABBITMQ_HEARTBEAT",
        30,
      ),
      reconnectTimeInSeconds: this.configService.get<number>(
        "RABBITMQ_RECONNECT_DELAY",
        5,
      ),
    });

    this.connection.on("connect", () => this.logger.log("RabbitMQ 연결"));
    this.connection.on("disconnect", (params) =>
      this.logger.error(
        `RabbitMQ 연결 해제: ${params.err?.message ?? "unknown error"}`,
      ),
    );

    this.channel = this.connection.createChannel({
      json: true,
      setup: async (channel: ConfirmChannel) => {
        const exchange = this.configService.get<string>(
          "NOTIFICATION_EXCHANGE",
          RABBITMQ_DEFAULT_EXCHANGE,
        );
        await channel.assertExchange(exchange, "topic", {durable: true});
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel
      ?.close()
      .catch((error) =>
        this.logger.error("Failed to close RabbitMQ channel", error),
      );
    await this.connection
      ?.close()
      .catch((error) =>
        this.logger.error("Failed to close RabbitMQ connection", error),
      );
  }

  async publish<T>(
    routingKey: string,
    payload: T,
    exchange?: string,
  ): Promise<void> {
    if (!this.channel) {
      this.logger.warn(
        `RabbitMQ channel is not initialized. Skip publish for ${routingKey}`,
      );
      return;
    }

    const targetExchange =
      exchange ??
      this.configService.get<string>(
        "NOTIFICATION_EXCHANGE",
        RABBITMQ_DEFAULT_EXCHANGE,
      );
    await this.channel.publish(targetExchange, routingKey, payload, {
      persistent: true,
      contentType: "application/json",
    });
  }

  async consume(
    queue: string,
    handler: (message: ConsumeMessage) => Promise<boolean>,
    options: {routingKey: string; exchange?: string; prefetch?: number},
  ): Promise<void> {
    if (!this.channel) {
      this.logger.warn(
        `RabbitMQ channel is not initialized. Skip consume for queue ${queue}`,
      );
      return;
    }

    const exchange =
      options.exchange ??
      this.configService.get<string>(
        "NOTIFICATION_EXCHANGE",
        RABBITMQ_DEFAULT_EXCHANGE,
      );

    this.logger.debug(
      `[RabbitmqService] Consume request: Queue=${queue}, RoutingKey=${options.routingKey}, Exchange=${exchange}`,
    );

    await this.channel.addSetup(async (channel: ConfirmChannel) => {
      await channel.assertExchange(exchange, "topic", {durable: true});
      const assertedQueue = await channel.assertQueue(queue, {durable: true});
      if (options.prefetch) {
        await channel.prefetch(options.prefetch);
      }
      await channel.bindQueue(
        assertedQueue.queue,
        exchange,
        options.routingKey,
      );

      await channel.consume(assertedQueue.queue, async (message) => {
        if (!message) return;

        try {
          // 👇 handler가 false를 리턴하면 “메시지 skip (ack)” 처리
          const handled = await handler(message);
          if (handled === false) {
            this.logger.debug(
              `[RabbitmqService] Skipped message (ack immediately)`,
            );
            channel.ack(message);
            return;
          }

          // handler가 정상 처리 → ack
          channel.ack(message);
        } catch (error) {
          this.logger.error(
            `Failed to process message on ${queue}`,
            error as Error,
          );
          channel.nack(message, false, false); // 재전송 안 함
        }
      });
    });
  }
}
