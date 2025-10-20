import {SelectQueryBuilder} from "typeorm";

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  totalPage: number;
  currentPage: number;
  nextPage: number | null;
  previousPage: number | null;
}

export class PaginationHelper {
  /**
   * 페이지네이션을 쿼리빌더에 적용
   */
  static applyPagination<T>(
    query: SelectQueryBuilder<T>,
    options: PaginationOptions,
  ): SelectQueryBuilder<T> {
    const {page, limit} = options;
    const skip = (page - 1) * limit;

    return query.skip(skip).take(limit);
  }

  /**
   * 페이지네이션 결과 생성
   */
  static createPaginationResult<T>(
    data: T[],
    total: number,
    options: PaginationOptions,
  ): PaginationResult<T> {
    const {page, limit} = options;
    const totalPage = Math.ceil(total / limit);

    return {
      data,
      total,
      totalPage,
      currentPage: page,
      nextPage: page < totalPage ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
    };
  }

  /**
   * 페이지네이션 옵션 검증 및 기본값 설정
   */
  static validatePaginationOptions(
    page?: number,
    limit?: number,
    maxLimit: number = 100,
  ): PaginationOptions {
    const validatedPage = page && page > 0 ? page : 1;
    const validatedLimit = limit && limit > 0 ? Math.min(limit, maxLimit) : 8;

    return {
      page: validatedPage,
      limit: validatedLimit,
    };
  }

  /**
   * 병렬 쿼리 실행 (데이터 + 카운트)
   */
  static async executeParallel<T>(
    dataQuery: SelectQueryBuilder<T>,
    countQuery: SelectQueryBuilder<T>,
    options: PaginationOptions,
  ): Promise<[T[], number]> {
    const paginatedDataQuery = this.applyPagination(dataQuery, options);

    return await Promise.all([
      paginatedDataQuery.getMany(),
      countQuery.getCount(),
    ]);
  }
}
