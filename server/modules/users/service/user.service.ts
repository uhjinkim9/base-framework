import {
  HttpStatus,
  Injectable,
  Inject,
  forwardRef,
  Logger,
} from "@nestjs/common";
import {plainToInstance} from "class-transformer";
import {InjectRepository} from "@nestjs/typeorm";
import {In, Repository} from "typeorm";
import {ConfigService} from "@nestjs/config";
import {partialDto} from "src/common/util/partial-dto";
import {Result} from "src/common/util/result";
import {UserReqDto} from "../dto/req/user.req-dto";
import {UserResDto} from "../dto/res/user.res-dto";
import {UserEntity} from "../entity/user.entity";
import {LoginInfoReqDto} from "../dto/req/login-info.req-dto";

import password from "src/helpers/password";
import {JWTService} from "src/modules/jwt/service/jwt.service";
import {RabbitmqPublisherService} from "src/modules/messaging/rabbitmq-publisher.service";
import {Tokens} from "src/modules/jwt/types/tokens.type";
import {NotificationEventPayload} from "src/modules/messaging/type/notification-payload.type";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,

    @Inject(forwardRef(() => JWTService)) // 서비스 순환 참조 시 주입법
    private readonly jwtService: JWTService,

    private readonly pubSvc: RabbitmqPublisherService,

    private readonly configService: ConfigService,
  ) {}
  private readonly logger = new Logger(UserService.name);

  async doLogin(dto: LoginInfoReqDto): Promise<Result<Tokens>> {
    const {userId, userPw, deviceId, requestInfo} = dto;
    const {userAgent, loginIp} = requestInfo;

    // ID로 유저 정보 있는지 검증
    const existingUser = await this.getUser(userId);
    const user = existingUser?.data;
    const roleId = user?.roleId;
    if (existingUser?.statusCode !== 200) {
      return Result.error(
        HttpStatus.UNAUTHORIZED,
        "해당하는 사용자가 없습니다.",
      );
    }
    this.logger.log(`[${userId}/${user.roleId} 로그인] 액세스 토큰 발급`);

    // 비밀번호 검증
    const pwMatch =
      user.userPw && (await password.compare(user.userPw, userPw));
    if (!pwMatch) {
      return Result.error(
        HttpStatus.UNAUTHORIZED,
        "비밀번호가 일치하지 않습니다.",
      );
    }

    // JWT 발급
    const {accessToken, refreshToken} = this.jwtService.issueToken(
      {
        userId: userId,
        deviceId: deviceId,
        userAgent: userAgent,
        loginIp: loginIp,
        roleId: roleId,
      },
      false,
    );

    // 발급된 리프레시 토큰 DB 저장
    if (refreshToken) {
      await this.jwtService.insertRefreshToken(
        userId,
        deviceId,
        refreshToken,
        loginIp,
        userAgent,
      );
    }

    // 알림 이벤트 발행
    const notificationExchange = this.configService.get<string>(
      "NOTIFICATION_EXCHANGE", // 알림 서비스가 듣는 Exchange 이름
      "notification.exchange",
    );
    this.logger.log(`알림 이벤트 발행 완료: ${notificationExchange}`);

    const publishPayload: NotificationEventPayload = {
      event: "login", // 알림 서비스가 인지할 이벤트 타입 (클라이언트에 emit될 이벤트명도 됨)
      userId: userId, // 알림을 받을 특정 유저 ID (개별 알림)
      title: "로그인 성공",
      body: `${user.userNm || userId}님이 로그인했습니다.`, // user.userNm을 사용하면 더 사용자 친화적
      data: {url: "/home", loginIp: loginIp, deviceId: deviceId}, // 클라이언트에 추가로 보낼 데이터
    };

    await this.pubSvc.publish(
      // 알림 서비스의 RabbitmqConsumer가 듣는 라우팅 키 ("notification.external" 패턴에 매칭됨)
      "notification.external.event",
      publishPayload,
      // 알림 서비스의 exchange로 발행
      notificationExchange,
    );
    this.logger.log(
      `[${userId}] 로그인 성공 알림 이벤트 RabbitMQ에 발행 - Payload: ${JSON.stringify(publishPayload)}`,
    );

    // 발급된 토큰 반환
    const res = {
      accessToken,
      refreshToken,
      existingUser,
    };
    this.logger.log(`토큰: ${res}`);

    return Result.success(res, `${userId}님 로그인하였습니다.`);
  }

  /**
   * 사용자 목록을 가져오는 함수
   */
  async getUsers(dto: UserReqDto): Promise<Result<UserResDto[]>> {
    const users = await this.userRepo.find({
      where: dto,
      order: {createdAt: "DESC"},
      select: {
        userId: true,
        userPw: false, // 비밀번호는 반환하지 않음
        companyId: true,
        userNm: true,
        isUsed: true,
        isRestricted: true,
        roleId: true,
        loginFailCount: true,
        email: true,
        extEmail: true,
        isEmailSubscribed: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
    const res = plainToInstance(UserResDto, users);
    return Result.success(res, "사용자 목록 조회 성공");
  }

  /**
   * 선택된 사용자들의 역할을 일괄 변경하는 함수
   */
  async updateUsersRole(dto: {
    roleId: string;
    userIds: string[];
  }): Promise<Result<UserResDto[]>> {
    const {roleId, userIds} = dto;
    if (!roleId || !userIds.length) {
      return Result.error(
        HttpStatus.BAD_REQUEST,
        "roleId 또는 userIds가 누락되었습니다.",
      );
    }
    await this.userRepo
      .createQueryBuilder()
      .update()
      .set({roleId})
      .where("userId IN (:...userIds)", {userIds})
      .execute();

    const updatedUsers = await this.userRepo.findBy({userId: In(userIds)});
    if (!updatedUsers.length) {
      return Result.error(
        HttpStatus.NOT_FOUND,
        "업데이트된 사용자가 없습니다.",
      );
    }
    const res = plainToInstance(UserResDto, updatedUsers);
    return Result.success(res, "사용자 역할 일괄 변경 성공");
  }

  //TODO: 사용자 생성 - 아직 미사용
  /**
   * 비밀번호 검증 없이 사용자 정보를 생성하거나 업데이트하는 함수
   */
  async createOrUpdateUser(dto: UserReqDto): Promise<Result<UserResDto>> {
    const partial = partialDto(dto);
    const user = await this.userRepo.save(partial);
    if (!user) {
      return Result.error(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다.");
    }
    const res = plainToInstance(UserResDto, user);
    return Result.success(res, "사용자 정보 저장 성공");
  }

  /**
   * 사용자 ID를 통해 한 명의 정보 가져오는 함수
   */
  async getUser(userId: string): Promise<Result<UserResDto>> {
    const user = await this.userRepo.findOneBy({userId});
    const res = plainToInstance(UserResDto, user);
    return Result.success(res, "사용자 정보 조회 성공");
  }
}
