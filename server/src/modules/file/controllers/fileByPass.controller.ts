import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { FileService } from '../services/file.service';
import * as path from 'path';
import * as fs from 'fs';
import * as mime from 'mime';

@Controller('uploads')
export class FileController {
  constructor(private readonly fileSvc: FileService) {}

  @Get('/:fileName')
  async previewFile(
    @Param('fileName') fileName: string,
    @Query('download') download: string,
    @Res() res: Response,
  ) {
    // axios에서 자동 인코딩되어 온 파일명 디코딩
    const decodedFileName = decodeURIComponent(fileName);
    const ext = path.extname(fileName).toLowerCase();

    // __dirname으로 하면 dist 폴더 기준이 되어버림
    const filePath = path.join(process.cwd(), './uploads', decodedFileName);
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
