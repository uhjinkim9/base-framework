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
import {ConfirmChannel} from "amqplib";

import {RABBITMQ_DEFAULT_EXCHANGE} from "./rabbitmq.constants";

@Injectable()
export class RabbitmqPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqPublisherService.name);
  private connection?: AmqpConnectionManager;
  private channel?: ChannelWrapper;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url = this.configService.get<string>("RABBITMQ_URL");

    if (!url) {
      this.logger.warn("환경 변수에서 RABBITMQ_URL을 찾을 수 없습니다.");
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

    this.connection.on("connect", () =>
      this.logger.log("RabbitMQ에 연결되었습니다."),
    );
    this.connection.on("disconnect", (params) =>
      this.logger.error(
        `RabbitMQ 연결 끊김: ${params.err?.message ?? "알 수 없는 오류"}`,
      ),
    );

    this.channel = this.connection.createChannel({
      json: true,
      setup: async (channel: ConfirmChannel) => {
        // 서비스를 사용하는 앱에서 메시지를 발행할 때 사용할 기본 exchange
        // 예를 들어 'notification.exchange'가 될 수도 있고, 해당 앱의 고유한 exchange가 될 수도 있음
        const exchange = this.configService.get<string>(
          "NOTIFICATION_EXCHANGE",
          RABBITMQ_DEFAULT_EXCHANGE,
        );
        await channel.assertExchange(exchange, "topic", {durable: true});
        this.logger.log(`Exchange '${exchange}' 준비 완료`);
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel
      ?.close()
      .catch((error) => this.logger.error("RabbitMQ 채널 닫기 실패", error));
    await this.connection
      ?.close()
      .catch((error) => this.logger.error("RabbitMQ 연결 닫기 실패", error));
  }

  async publish<T>(
    routingKey: string,
    payload: T,
    exchange?: string,
  ): Promise<void> {
    if (!this.channel) {
      this.logger.warn(
        `RabbitMQ 채널이 초기화되지 않았습니다. ${routingKey}에 대한 발행을 건너뜁니다.`,
      );
      return;
    }

    // `NOTIFICATION_EXCHANGE`라는 환경변수 이름을 `RABBITMQ_DEFAULT_PUBLISH_EXCHANGE` 등으로
    // 변경하여 이 서비스의 목적(발행)을 더 명확히 할 수도 있습니다.
    const targetExchange =
      exchange ??
      this.configService.get<string>(
        "RABBITMQ_DEFAULT_PUBLISH_EXCHANGE",
        RABBITMQ_DEFAULT_EXCHANGE,
      );

    await this.channel.publish(
      targetExchange,
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      {
        persistent: true,
        contentType: "application/json",
      },
    );
    this.logger.debug(
      `'${targetExchange}'에 '${routingKey}'로 메시지를 발행했습니다.`,
    );
  }
}
