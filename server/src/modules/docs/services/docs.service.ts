import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Between, DataSource, In, Repository} from "typeorm";
import {plainToInstance} from "class-transformer";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

import {isEmpty} from "src/common/util/check-empty";
import {Result} from "src/common/util/result";

import {DocReqDto} from "../dto/req/doc.req-dto";
import {DocEntity} from "../entities/doc.entity";
import {DocResDto} from "../dto/res/doc.res-dto";

import {DocStatusEnum} from "../etc/doc.type";
import {PaginationReqDto} from "../dto/req/pagination.req-dto";
import {PaginationResDto} from "../dto/res/pagination.res-dto";

@Injectable()
export class DocsService {
  private readonly logger = new Logger(DocsService.name);

  constructor(
    @InjectRepository(DocEntity)
    private readonly docRepo: Repository<DocEntity>,

    private readonly dataSource: DataSource,
  ) {}

  async createOrUpdateProof(dto: DocReqDto): Promise<Result<DocResDto>> {
    const userId = dto.payload?.userId;
    const {idx} = dto;
    if (isEmpty(idx)) {
      // create일 때
      dto.creatorId = userId;
    } else {
      // update일 때
      dto.updaterId = userId;
    }

    const doc = await this.docRepo.save(dto);
    dto.idx = doc.idx;

    const res = plainToInstance(DocResDto, doc);
    return Result.success(res, "문서 생성 완료");
  }

  async getPaginatedProofs(
    dto: PaginationReqDto,
  ): Promise<Result<PaginationResDto>> {
    const {option, payload} = dto;
    const {page, limit, menuId, searchKeyword} = option;
    const userId = payload?.userId;
    if (isEmpty(userId)) {
      return Result.error(
        HttpStatus.UNAUTHORIZED,
        "토큰에 사용자 ID가 없습니다.",
      );
    }

    const parsedPage = page ? Math.max(page, 1) : 1;
    const parsedLimit = limit ? Math.min(limit, 100) : 8;

    // 기본 쿼리 빌더 생성
    const baseQuery = this.docRepo.createQueryBuilder("doc");

    // 검색 키워드 적용
    if (searchKeyword?.trim()) {
      baseQuery.andWhere("doc.doc_nm LIKE :keyword", {
        keyword: `%${searchKeyword}%`,
      });
    }

    // 메뉴별 조건 적용 및 관점(신청자/담당자) 결정
    const {query, isManagerView} = this.buildQueryByMenuId(
      baseQuery,
      menuId,
      userId,
    );

    // 결과 조회
    const [results, total] = await Promise.all([
      query
        .orderBy("doc.created_at", "DESC")
        .skip((parsedPage - 1) * parsedLimit)
        .take(parsedLimit)
        .getMany(),
      query.getCount(),
    ]);

    // 페이지네이션 정보 계산
    const totalPage = Math.ceil(total / parsedLimit);
    const nextPage = parsedPage < totalPage ? parsedPage + 1 : null;
    const previousPage = parsedPage > 1 ? parsedPage - 1 : null;

    const response: PaginationResDto = {
      nextPage,
      previousPage,
      totalPage,
      results: results.map((result) => plainToInstance(DocResDto, result)),
    };

    const message = isManagerView
      ? "담당자 문서 목록 조회 완료"
      : "신청 문서 목록 조회 완료";

    return Result.success(response, message);
  }

  private buildQueryByMenuId(baseQuery: any, menuId: string, userId: string) {
    // 신청자 관점 메뉴들
    const userMenus = [
      "status-wait",
      "status-done",
      "status-all",
      "proof-temp",
      "proof-scheduled",
    ];
    // 담당자 관점 메뉴들
    const managerMenus = ["received-req", "approved-req", "rejected-req"];

    const isManagerView = managerMenus.includes(menuId);
    const isUserView = userMenus.includes(menuId);

    // 알 수 없는 메뉴 ID에 대한 에러 처리
    if (!isManagerView && !isUserView) {
      throw new HttpException(
        `알 수 없는 메뉴 ID: ${menuId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const query = baseQuery.clone();

    if (isManagerView) {
      // 담당자 관점: 담당자인 문서들만 조회
      query.andWhere("doc.reviewer_id = :reviewerId", {reviewerId: userId});
    } else {
      // 신청자 관점: 자신이 신청한 문서들만 조회
      query.andWhere("doc.creator_id = :creatorId", {creatorId: userId});
    }

    // 메뉴별 세부 조건
    switch (menuId) {
      // 신청자 관점
      case "status-wait":
        query
          .andWhere("doc.is_temp_saved = :isTempSaved", {isTempSaved: 0})
          .andWhere("doc.is_scheduled = :isScheduled", {isScheduled: 0})
          .andWhere("doc.status = :status", {
            status: DocStatusEnum.SUBMITTED,
          });
        break;
      case "status-done":
        query
          .andWhere("doc.is_temp_saved = :isTempSaved", {isTempSaved: 0})
          .andWhere("doc.is_scheduled = :isScheduled", {isScheduled: 0})
          .andWhere("doc.status IN (:...status)", {
            status: [
              DocStatusEnum.APPROVED,
              DocStatusEnum.REJECTED,
              DocStatusEnum.CANCELED,
            ],
          });
        break;
      case "proof-temp":
        query.andWhere("doc.is_temp_saved = :isTempSaved", {isTempSaved: 1});
        break;
      case "proof-scheduled":
        query.andWhere("doc.is_scheduled = :isScheduled", {isScheduled: 1});
        break;
      case "status-all":
        query
          .andWhere("doc.is_temp_saved = :isTempSaved", {isTempSaved: 0})
          .andWhere("doc.is_scheduled = :isScheduled", {isScheduled: 0});
        break;

      // 담당자 관점
      case "received-req":
        query
          .andWhere("doc.is_temp_saved = :isTempSaved", {isTempSaved: 0})
          .andWhere("doc.is_scheduled = :isScheduled", {isScheduled: 0})
          .andWhere("doc.status = :status", {
            status: DocStatusEnum.SUBMITTED,
          });
        break;
      case "approved-req":
        query
          .andWhere("doc.is_temp_saved = :isTempSaved", {isTempSaved: 0})
          .andWhere("doc.is_scheduled = :isScheduled", {isScheduled: 0})
          .andWhere("doc.status = :status", {status: DocStatusEnum.APPROVED});
        break;
      case "rejected-req":
        query
          .andWhere("doc.is_temp_saved = :isTempSaved", {isTempSaved: 0})
          .andWhere("doc.is_scheduled = :isScheduled", {isScheduled: 0})
          .andWhere("doc.status = :status", {status: DocStatusEnum.REJECTED});
        break;
    }

    return {query, isManagerView};
  }

  async getDoc(dto: DocReqDto): Promise<Result<DocResDto>> {
    const {idx} = dto;
    const doc = await this.docRepo.findOne({
      where: {
        idx: idx,
      },
    });

    const res = plainToInstance(DocResDto, doc);
    return Result.success(res, "제증명 조회 완료");
  }
}
