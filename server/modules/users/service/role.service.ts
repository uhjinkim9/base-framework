import {HttpStatus, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {HttpService} from "@nestjs/axios";
import {plainToInstance} from "class-transformer";
import {DataSource, In, Repository} from "typeorm";
import {firstValueFrom} from "rxjs";

import {Result} from "src/common/util/result";
import {isEmpty} from "src/common/util/check-empty";
import {partialDto} from "src/common/util/partial-dto";

import {UserEntity} from "../entity/user.entity";
import {RoleEntity} from "../entity/role.entity";
import {RoleMenuMapEntity} from "../entity/role-menu-map.entity";

import {UserReqDto} from "../dto/req/user.req-dto";
import {RoleReqDto} from "../dto/req/role.req-dto";
import {RoleResDto} from "../dto/res/role.res-dto";
import {RoleMenuMapReqDto} from "../dto/req/role-menu-map.req-dto";
import {RoleMenuMapResDto} from "../dto/res/role-menu-map.res-dto";

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepo: Repository<RoleEntity>,
    @InjectRepository(RoleMenuMapEntity)
    private rmRepo: Repository<RoleMenuMapEntity>,

    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
  ) {}

  // 특정 유저의 권한에 해당하는 메뉴 가져오기
  async getUserRoleMenus(dto: UserReqDto): Promise<Result<any>> {
    const {userId} = dto;
    if (isEmpty(userId))
      return Result.error(
        HttpStatus.BAD_REQUEST,
        "요청에 필요한 유저 ID가 없습니다.",
      );

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    // 1. users 테이블에서 userId를 통해 roleId 확인
    try {
      const user = await qr.manager.findOne(this.userRepo.target, {
        where: {
          userId: userId,
        },
      });
      await qr.commitTransaction(); // 트랜잭션 커밋
      if (isEmpty(user))
        return Result.error(HttpStatus.NOT_FOUND, "조회된 회원이 없습니다.");

      const roleId = user?.roleId;
      if (isEmpty(roleId))
        return Result.error(HttpStatus.NOT_FOUND, "할당된 역할이 없습니다.");

      // 2. 해당 roleId로 roles 테이블의 roleId
      const role = await qr.manager.findOne(this.roleRepo.target, {
        where: {
          roleId: roleId,
        },
      });
      if (isEmpty(role))
        return Result.error(
          HttpStatus.NOT_FOUND,
          "roleId에 해당하는 역할이 존재하지 않습니다.",
        );
      if (roleId === "dev") {
        return Result.success(
          {roleId: roleId},
          "개발자 역할 - 모두 접근 가능합니다.",
        );
      }

      // 3. 해당 roleId로 role_menus 테이블 rows 로딩
      const roleMenus = await qr.manager.find(this.rmRepo.target, {
        where: {
          roleId: roleId,
        },
      });
      if (isEmpty(roleMenus))
        return Result.error(
          HttpStatus.NOT_FOUND,
          "roleId에 할당된 메뉴가 없습니다.",
        );

      // 4. 성공 응답
      return Result.success(
        roleMenus,
        "해당 회원이 접근 가능한 메뉴 목록입니다.",
      );
    } catch (err) {
      await qr.rollbackTransaction();
      return Result.error(
        HttpStatus.BAD_REQUEST,
        "/auth/getUserRoleMenus 쿼리 실행 실패, 롤백",
      );
    } finally {
      await qr.release();
    }
  }

  // roleId로 해당 역할에 매핑된 메뉴 ID 목록 조회 (다른 MSA 서비스에서 호출용)
  async getRoleMenuIds(dto: RoleReqDto): Promise<Result<string[]>> {
    const {roleId} = dto;
    if (isEmpty(roleId)) {
      return Result.error(
        HttpStatus.BAD_REQUEST,
        "roleId가 필요합니다.",
      );
    }

    // dev 역할은 모든 메뉴 접근 가능
    if (roleId === "dev") {
      return Result.success(
        [],
        "개발자 역할 - 모든 메뉴 접근 가능",
      );
    }

    try {
      const roleMenus = await this.rmRepo.find({
        where: {
          roleId: roleId,
          isUsed: 1, // 사용 중인 매핑만
        },
        select: ["menuId"], // menuId만 선택
      });

      const menuIds = roleMenus.map((rm) => rm.menuId);
      return Result.success(
        menuIds,
        `역할 ${roleId}에 매핑된 메뉴 ID 목록`,
      );
    } catch (err) {
      return Result.error(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `메뉴 ID 조회 실패: ${err.message}`,
      );
    }
  }

  /*************************** 관리자 ***************************/

  // 관리자: 모든 역할 불러오기
  async getUserRoles(dto: RoleReqDto): Promise<Result<RoleResDto[]>> {
    const partial = partialDto(dto); // roleId
    const roles = await this.roleRepo.find({
      where: partial,
      order: {
        createdAt: "ASC",
      },
    });
    const res = plainToInstance(RoleResDto, roles);
    return Result.success(res, "역할 조회 성공");
  }

  // 관리자: 역할 하나 불러오기
  async getRole(dto: RoleReqDto): Promise<Result<RoleResDto>> {
    const partial = partialDto(dto); // roleId
    const roles = await this.roleRepo.findOne({where: partial});
    const res = plainToInstance(RoleResDto, roles);
    return Result.success(res, "역할 조회 성공");
  }

  // 관리자: 역할 삭제
  async deleteRole(idList: string[]): Promise<Result<any>> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      await qr.manager.softDelete(this.roleRepo.target, {
        roleId: In(idList),
      });
      await qr.manager.softDelete(this.rmRepo.target, {
        roleId: In(idList),
      });

      await qr.commitTransaction(); // 트랜잭션 커밋
      return Result.success({success: true}, "역할 삭제 완료");
    } catch (err) {
      await qr.rollbackTransaction();
      return Result.error(HttpStatus.BAD_REQUEST, "쿼리 실행 실패, 롤백");
    } finally {
      await qr.release();
    }
  }

  async getRoleMenu(
    dto: RoleMenuMapReqDto,
  ): Promise<Result<RoleMenuMapResDto>> {
    const {roleId, menuId} = dto;
    const menu = await this.rmRepo.findOne({
      where: {
        menuId: menuId,
        roleId: roleId,
      },
    });
    const res = plainToInstance(RoleMenuMapResDto, menu);
    return Result.success(res, "메뉴 조회 성공");
  }

  // 관리자: 해당 역할에 맞는 메뉴들 불러오기
  async getRoleMenus(dto: RoleReqDto): Promise<Result<any[]>> {
    const partial = partialDto(dto); // roleId

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // 1. DTO(roleId)에 해당하는 roleMenus 가져오기
      const roleMenus = await qr.manager.find(this.rmRepo.target, {
        where: partial,
      });

      // 2. roleMenus에서 menuId만 추출
      const menuIds = roleMenus?.map((r: RoleMenuMapReqDto) => r.menuId);

      // 3. menu 서비스에서 menuId에 해당하는 메뉴들 가져오기
      const menus = (
        await Promise.all(
          menuIds.map(
            async (menuId) => await this.getMenusByRole({menuId: menuId}),
          ),
        )
      ).flat();
      // await엔 배열 존재하지 않음, 이중 배열 가능성 막기 위해 flat 처리

      // roleMenus, menus 조합
      // const roleMenusCombined = menus.map((menu) => {
      //   const match = roleMenus.find((r) => r.menuId === menu.menuId);
      //   return {
      //     ...menu,
      //     roleId: match?.roleId ?? dto.roleId,
      //     isReadable: match?.isReadable === 1 ? true : false,
      //     isWritable: match?.isWritable === 1 ? true : false,
      //   };
      // });
      const roleMenusCombined = menus.map((menu) => {
        const match = roleMenus.find((r) => r.menuId === menu.menuId);
        return {
          ...menu,
          roleId: match?.roleId ?? dto.roleId,
          roleUser: match?.roleUser === 1 ? true : false,
          roleAdmin: match?.roleAdmin === 1 ? true : false,
        };
      });

      // const res = plainToInstance(RoleResDto, menus);
      await qr.commitTransaction(); // 트랜잭션 커밋
      return Result.success(roleMenusCombined, "쿼리 실행 완료");
    } catch (err) {
      await qr.rollbackTransaction();
      return Result.error(HttpStatus.BAD_REQUEST, "쿼리 실행 실패, 롤백");
    } finally {
      await qr.release();
    }
  }

  // 관리자: Menu 서버에서 roleMenu가 가진 menuId에 맞는 menus 불러오기
  async getMenusByRole(dto: any): Promise<any[]> {
    try {
      const url = `${process.env.MENU_BASE_URL}/menu/getMenus`;
      const res$ = this.httpService.post<any>(url, dto, {
        headers: {"Content-Type": "application/json"},
      }); // 구독 객체

      // 첫 응답만 가져오는 Observable(RxJS 스트림) → Promise화 함수
      const response = await firstValueFrom(res$);
      return response.data.data;
    } catch (err) {
      console.error("Axios Error:", err.message);
      if ("response" in err) {
        console.error(
          "Response Error:",
          (err as any).response?.status,
          (err as any).response?.data,
        );
      }
      throw err;
    }
  }

  // Role 데이터 추가
  async createOrUpdateRole(dto: RoleReqDto): Promise<Result<RoleResDto>> {
    const role = await this.roleRepo.save(dto);
    const res = plainToInstance(RoleResDto, role);
    return Result.success(res, "역할 생성 완료");
  }

  // RoleMenu 데이터 추가
  async createRoleMenu(
    dto: RoleMenuMapReqDto,
  ): Promise<Result<RoleMenuMapResDto>> {
    const menu = await this.rmRepo.save(dto);
    const res = plainToInstance(RoleMenuMapResDto, menu);
    return Result.success(res, "역할-메뉴 맵 생성 완료");
  }

  // 읽기/쓰기 권한 수정 시 사용
  async updateRoleMenu(
    dto: RoleMenuMapReqDto,
  ): Promise<Result<RoleMenuMapResDto>> {
    const {roleId, menuId, roleUser, roleAdmin} = dto;
    const roleMenu = await this.rmRepo.findOne({
      where: {
        roleId: roleId,
        menuId: menuId,
      },
    });
    if (isEmpty(roleMenu)) {
      return Result.error(
        HttpStatus.NOT_FOUND,
        "해당하는 Role-Menu 맵이 없습니다.",
      );
    }
    const roleMenuMapIdx = roleMenu.idx;
    const updated = await this.rmRepo.update(
      {idx: roleMenuMapIdx},
      {roleUser: roleUser, roleAdmin: roleAdmin},
    );

    const res = plainToInstance(RoleMenuMapResDto, updated);
    return Result.success(res, "역할-메뉴 맵 수정 완료");
  }

  // 관리자: 역할 삭제
  async deleteRoleMenu(idList: string[]): Promise<Result<any>> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      // 1. menuId에 맞는 roleMenuMap의 가져오기
      const result = await qr.manager.find(this.rmRepo.target, {
        where: {menuId: In(idList)},
      });
      // 2. 그 행의 idx 가져오기
      const idxList = result.map((r: RoleMenuMapEntity) => r.idx);
      // 3. 그 idx 가진 행 삭제
      await qr.manager.softDelete(this.rmRepo.target, {
        idx: In(idxList),
      });

      await qr.commitTransaction(); // 트랜잭션 커밋
      return Result.success(result, "쿼리 실행 완료");
    } catch (err) {
      await qr.rollbackTransaction();
      return Result.error(HttpStatus.BAD_REQUEST, "쿼리 실행 실패, 롤백");
    } finally {
      await qr.release();
    }
  }
}
