import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import multer from 'multer';

import * as path from 'path';
import * as fs from 'fs';
import * as mime from 'mime';

import {
  multerDiskOptions,
  createMulterDiskOptions,
} from '../etc/multer.option';
import { Result } from 'src/common/util/result';

import { FileService } from '../services/file.service';
import { AttachedFileReqDto } from '../dto/req/attached-file.req-dto';
import { GetFilesReqDto, UploadFilesReqDto } from '../dto/req/file.req-dto';
import { RequestInfoInterceptor } from 'src/common/interceptor/request-info.interceptor';
import { AttachedFileResDto } from '../dto/res/attached-file.res-dto';

@Controller('file')
export class FileController {
  constructor(private readonly fileSvc: FileService) {}

  @UseInterceptors(RequestInfoInterceptor)
  @Post('/uploadFile')
  @UseInterceptors(FileInterceptor('file', multerDiskOptions))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadFilesReqDto,
  ) {
    return this.fileSvc.uploadFile(file, body.moduleNm);
  }

  @Post('/uploadFiles/:moduleNm')
  async uploadFiles(
    @Param('moduleNm') moduleNm: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      console.log('📂 받은 moduleNm:', moduleNm);

      // 동적으로 multer 인스턴스 생성
      const upload = multer(createMulterDiskOptions(moduleNm));
      const uploadFiles = upload.array('files', 50);

      // multer 처리
      await new Promise<void>((resolve, reject) => {
        uploadFiles(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const files = req.files as Express.Multer.File[];
      const result = await this.fileSvc.uploadFiles(files, moduleNm);
      res.json(result);
    } catch (error) {
      console.error('파일 업로드 오류:', error);
      res.status(500).json({ error: error.message });
    }
  }

  @Post('/getFiles')
  async getFiles(@Body() dto: GetFilesReqDto): Promise<AttachedFileResDto[]> {
    return this.fileSvc.getFiles(dto);
  }

  @Post('/deleteFile')
  async deleteFile(@Body() dto: AttachedFileReqDto) {
    await this.fileSvc.deleteFile(dto);
  }

  @Get('/preview/:fileName')
  async previewFile(
    @Param('fileName') fileName: string,
    @Query('download') download: string,
    @Query('moduleNm') moduleNm: string = 'default', // moduleNm 쿼리 파라미터 추가
    @Res() res: Response,
  ) {
    // axios에서 자동 인코딩되어 온 파일명 디코딩
    const decodedFileName = decodeURIComponent(fileName);
    const ext = path.extname(fileName).toLowerCase();

    // moduleNm 폴더 구조에 맞는 파일 경로
    const filePath = path.join(
      process.cwd(),
      './uploads',
      moduleNm,
      decodedFileName,
    );
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('파일이 존재하지 않습니다.');
    }

    // 자동 MIME 설정
    const mimeType = mime.lookup(decodedFileName) || 'application/octet-stream';

    // Content-Disposition: 미리보기면 inline, 다운로드면 attachment 설정
    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    } else {
      res.setHeader('Content-Type', mimeType);
    }

    res.setHeader(
      'Content-Disposition',
      `${download === 'true' ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(decodedFileName)}`,
    );

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  }
}
