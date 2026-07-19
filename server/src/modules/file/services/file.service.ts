import { InjectRepository } from '@nestjs/typeorm';
import { HttpStatus, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';

import { Result } from 'src/common/util/result';

import { AttachedFileEntity } from '../entities/attached-file.entity';
import { AttachedFileReqDto } from '../dto/req/attached-file.req-dto';
import { GetFilesReqDto } from '../dto/req/file.req-dto';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(AttachedFileEntity)
    private fileRepo: Repository<AttachedFileEntity>,
  ) {}

  async uploadFile(file: Express.Multer.File, moduleNm?: string) {
    const originalName = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );
    const module = moduleNm || 'default';

    const saved = await this.fileRepo.save({
      fileName: originalName,
      fileType: file.mimetype,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      filePath: `/uploads/${module}/${file.filename}`, // moduleNm 폴더 구조 적용
      moduleNm: module, // moduleNm 저장
    });

    return saved;
  }

  async uploadFiles(
    files: Express.Multer.File[],
    moduleNm?: string,
  ): Promise<Result<any>> {
    const savedFiles: { fileIdx: number }[] = [];
    const module = moduleNm || 'default';

    for (const file of Array.isArray(files) ? files : [files]) {
      const originalName = Buffer.from(file.originalname, 'latin1').toString(
        'utf8',
      );
      const saved = await this.fileRepo.save({
        fileName: originalName, // 사용자에게 보여줄 이름
        fileType: file.mimetype,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        filePath: `/uploads/${module}/${file.filename}`, // moduleNm 폴더 구조 적용
        moduleNm: module, // moduleNm 저장
      });
      if (!saved) return Result.error(HttpStatus.NOT_FOUND, '파일 업로드 실패');

      savedFiles.push({
        fileIdx: saved.fileIdx,
      });
    }
    const res = {
      uploaded: savedFiles,
    };
    return Result.success(res, '파일 업로드 완료');
  }

  async getFiles(dto: GetFilesReqDto) {
    try {
      const { fileIdxes, moduleNm } = dto;

      // moduleNm이 있으면 필터링, 없으면 전체 조회
      const whereCondition: any = {
        fileIdx: In(fileIdxes),
      };

      if (moduleNm) {
        whereCondition.moduleNm = moduleNm;
      }

      const res = this.fileRepo.find({
        where: whereCondition,
      });
      return res;
    } catch (e) {
      console.error('Error in getFiles:', e);
      throw e;
    }
  }

  async deleteFile(dto: AttachedFileReqDto) {
    const { fileIdx } = dto;
    try {
      await this.fileRepo
        .createQueryBuilder('file') // alias
        .delete()
        .from(AttachedFileEntity)
        .where('file_idx = :id', { id: fileIdx })
        .execute();
    } catch (e) {
      console.error('Error in deleteFile:', e);
      throw e;
    }
  }
}
