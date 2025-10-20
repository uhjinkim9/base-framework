import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, In, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { isEmpty, return404ErrorIfEmpty } from 'src/common/util/check-empty';
import { Result } from 'src/common/util/result';

import { DocReqDto } from '../dto/req/doc.req-dto';
import { DocEntity } from '../entities/doc.entity';

@Injectable()
export class DocsDashBoardService {
  constructor(
    @InjectRepository(DocEntity)
    private readonly docRepo: Repository<DocEntity>,

    private readonly dataSource: DataSource,
  ) {}

  async getProofDashboard(dto: DocReqDto): Promise<Result<any>> {
    const userId = dto.payload?.userId;

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // 요청자 기준 발급 현황 카운트
      const statusCountsRaw = await qr.manager
        .createQueryBuilder(this.docRepo.target, 'doc')
        .select('doc.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('doc.creatorId = :userId', { userId })
        .andWhere('doc.isTempSaved = 0')
        .andWhere('doc.isScheduled = 0')
        .groupBy('doc.status')
        .getRawMany();
      const totalCount = statusCountsRaw.reduce(
        (sum, row) => sum + Number(row.count),
        0,
      );
      const statusCounts = [
        { status: 'all', count: String(totalCount) },
        ...statusCountsRaw.map((row) => ({
          status: row.status,
          count: String(row.count),
        })),
      ];

      // 담당자 기준 수신한 요청 현황 카운트
      const managerStatusCountsRaw = await qr.manager
        .createQueryBuilder(this.docRepo.target, 'doc')
        .select('doc.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('doc.reviewerId = :userId', { userId })
        .andWhere('doc.isTempSaved = 0')
        .andWhere('doc.isScheduled = 0')
        .groupBy('doc.status')
        .getRawMany();
      const managerTotalCount = managerStatusCountsRaw.reduce(
        (sum, row) => sum + Number(row.count),
        0,
      );
      const managerCounts = [
        { status: 'all', count: String(managerTotalCount) },
        ...managerStatusCountsRaw.map((row) => ({
          status: row.status,
          count: String(row.count),
        })),
      ];

      // 요청자 기준: 최근 발급 3개 (createdAt 기준)
      const recentIssuedDocs = await qr.manager
        .createQueryBuilder(this.docRepo.target, 'doc')
        .select([
          'doc.idx as idx',
          'doc.status as status',
          'doc.docNm as docNm',
          'doc.creatorId as creatorId',
          'doc.createdAt as createdAt',
        ])
        .where('doc.creatorId = :userId', { userId })
        .andWhere('doc.isTempSaved = 0')
        .andWhere('doc.isScheduled = 0')
        .orderBy('doc.createdAt', 'DESC')
        .limit(3)
        .getRawMany();

      // 담당자 기준: 최근 요청 3개 (submitted 상태, reviewerId가 userId와 같을 경우)
      const recentRequestedDocs = await qr.manager
        .createQueryBuilder(this.docRepo.target, 'doc')
        .select([
          'doc.idx as idx',
          'doc.status as status',
          'doc.docNm as docNm',
          'doc.creatorId as creatorId',
          'doc.createdAt as createdAt',
        ])
        .where('doc.reviewerId = :userId', { userId })
        .andWhere('doc.status = :status', { status: 'submitted' })
        .andWhere('doc.isTempSaved = 0')
        .andWhere('doc.isScheduled = 0')
        .orderBy('doc.createdAt', 'DESC')
        .limit(3)
        .getRawMany();

      await qr.commitTransaction(); // 트랜잭션 커밋

      return Result.success(
        {
          userDashBoard: statusCounts,
          managerDashBoard: managerCounts,
          recentIssued: recentIssuedDocs,
          recentRequested: recentRequestedDocs,
        },
        '쿼리 실행 완료',
      );
    } catch (err) {
      await qr.rollbackTransaction();
      return Result.error(HttpStatus.BAD_REQUEST, '쿼리 실행 실패, 롤백');
    } finally {
      await qr.release();
    }
  }
}
