import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { FileService } from '../services/file.service';
import * as path from 'path';
import * as fs from 'fs';
import mime from 'mime';

@Controller('uploads')
export class FileController {
  constructor(private readonly fileSvc: FileService) {}

  @Get('/:filename')
  previewFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    const fileStream = fs.createReadStream(filePath);

    res.setHeader(
      'Content-Type',
      mime.lookup(filePath) || 'application/octet-stream',
    );
    res.setHeader('Content-Disposition', 'inline');
    fileStream.pipe(res);
  }
}
