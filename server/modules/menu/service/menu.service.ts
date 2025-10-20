import {InjectRepository} from "@nestjs/typeorm";
import {HttpStatus, Injectable, Logger} from "@nestjs/common";
import {plainToInstance} from "class-transformer";
import {In, Repository} from "typeorm";

import {partialDto} from "src/common/util/partial-dto";
import {Result} from "src/common/util/result";

import {MenuTreeEntity} from "../entity/MenuTree.entity";
import {
  BulkDeleteMenuReqDto,
  MenuTreeReqDto,
} from "../dto/req-dto/menu-tree.req-dto";
import {MenuTreeResDto} from "../dto/res-dto/menu-tree.res.dto";
import {generateNanoId} from "src/common/util/random-generator";

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuTreeEntity)
    private mtRepo: Repository<MenuTreeEntity>,
  ) {}
  private readonly logger = new Logger(MenuService.name);

  async insertMenu(dto: MenuTreeReqDto): Promise<Result<MenuTreeResDto>> {
    const userId = dto?.payload?.userId;
    const nanoId = await generateNanoId(4);
    dto.menuId = `${userId}-${nanoId}`;
    const partial = partialDto(dto);
    const saved = await this.mtRepo.save(partial);
    return Result.success(
      plainToInstance(MenuTreeResDto, saved),
      "헤더 메뉴가 생성되었습니다.",
    );
  }

  async updateMenu(dto: MenuTreeReqDto): Promise<Result<MenuTreeResDto>> {
    dto.isChangeable = 0; // 수정 시 매뉴 ID 변경 불가능하도록 설정
    delete dto.payload; // payload만 제거
    const entity = plainToInstance(MenuTreeEntity, dto);
    await this.mtRepo.update({idx: dto.idx}, entity);
    const updated = await this.mtRepo.findOne({
      where: {idx: dto.idx},
    });
    return Result.success(
      plainToInstance(MenuTreeResDto, updated),
      "헤더 메뉴 설정이 변경되었습니다.",
    );
  }

  async getMenus(dto: MenuTreeReqDto): Promise<Result<MenuTreeResDto[]>> {
    const partial = partialDto(dto);
    const menus = await this.mtRepo.find({
      where: partial,
      order: {
        nodeLevel: "ASC",
        seqNum: "ASC",
      },
    });
    const res = plainToInstance(MenuTreeResDto, menus);
    return Result.success(res, "조회 성공");
  }

  async deleteBulkMenu(dto: BulkDeleteMenuReqDto): Promise<Result<any>> {
    const {menuIdxs, nodeLevel} = dto;
    if (!menuIdxs || menuIdxs.length === 0) {
      return Result.error(HttpStatus.BAD_REQUEST, "삭제할 메뉴 ID가 없습니다.");
    }
    const deleted = await this.mtRepo.softDelete({
      idx: In(menuIdxs),
      nodeLevel: nodeLevel,
    });
    return Result.success(
      deleted,
      `${deleted.affected}개의 메뉴가 삭제되었습니다.`,
    );
  }

  async getMenu(dto: MenuTreeReqDto): Promise<Result<MenuTreeResDto>> {
    const {menuId} = dto;
    const menu = await this.mtRepo.findOne({
      where: {
        menuId: menuId,
      },
    });
    const res = plainToInstance(MenuTreeResDto, menu);
    return Result.success(res, "메뉴 조회 성공");
  }
}
