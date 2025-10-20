import {HttpStatus, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";

import {Result} from "src/common/util/result";
import {partialDto} from "src/common/util/partial-dto";

import {DocsMenuEntity} from "../entities/docs-menu.entity";
import {DocsMenuReqDto} from "../dto/req/docs-menu.req-dto";
import {DocsMenuResDto} from "../dto/res/docs-menu.res-dto";

@Injectable()
export class DocsMenuService {
  constructor(
    @InjectRepository(DocsMenuEntity)
    private amRepo: Repository<DocsMenuEntity>,

    private readonly dataSource: DataSource,
  ) {}

  async getDocsMenus(dto: DocsMenuReqDto): Promise<Result<DocsMenuResDto[]>> {
    const partial = partialDto(dto);

    // QueryBuilder를 사용하여 모든 레벨의 children에 isUsed 조건 적용
    let query = this.amRepo
      .createQueryBuilder("dm")
      .leftJoinAndSelect("dm.children", "children", "children.isUsed = 1")
      .leftJoinAndSelect(
        "children.children",
        "grandchildren",
        "grandchildren.isUsed = 1",
      )
      .leftJoinAndSelect(
        "grandchildren.children",
        "greatgrandchildren",
        "greatgrandchildren.isUsed = 1",
      )
      .where("dm.isUsed = 1")
      .orderBy("dm.seqNum", "ASC")
      .addOrderBy("children.seqNum", "ASC")
      .addOrderBy("grandchildren.seqNum", "ASC")
      .addOrderBy("greatgrandchildren.seqNum", "ASC");

    // partial 조건들 추가
    Object.keys(partial).forEach((key) => {
      if (partial[key] !== undefined) {
        query = query.andWhere(`dm.${key} = :${key}`, {[key]: partial[key]});
      }
    });

    const menus = await query.getMany();

    // 수동으로 DTO 변환 (명확하고 안전함)
    const convertedMenus = this.convertToResponseDto(menus);

    return Result.success(
      convertedMenus,
      `Docs 사이드바 메뉴(${partial.upperNode}) 로딩 완료`,
    );
  }

  private convertToResponseDto(menus: DocsMenuEntity[]): any[] {
    return menus.map((menu) => ({
      menuIdx: menu.menuIdx,
      menuId: menu.menuId,
      menuNm: menu.menuNm,
      nodeLevel: menu.nodeLevel,
      upperNode: menu.upperNode,
      isCustomed: Boolean(menu.isCustomed), // 명확한 변환
      isUsed: Boolean(menu.isUsed), // 명확한 변환
      seqNum: menu.seqNum,
      memo: menu.memo,
      joinEmpNo: menu.joinEmpNo,
      joinDeptCd: menu.joinDeptCd,
      creatorId: menu.creatorId,
      updaterId: menu.updaterId,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
      children: menu.children ? this.convertToResponseDto(menu.children) : [],
    }));
  }
}
