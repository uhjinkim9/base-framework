/** Multer의 역할 정리
 * 1. 프론트에서 전송한 multipart/form-data 요청을 파싱한다
 * 2. 파일을 저장하고, 파일 정보를 req.file 또는 req.files에 붙여준다
 * 3. 저장 방식과 파일명 커스터마이징 가능 (diskStorage)
 * NestJS에서	FileInterceptor, FilesInterceptor로 간편하게 사용 가능
 */

import { HttpException, HttpStatus } from '@nestjs/common';
import { diskStorage, memoryStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { generateUUID } from 'src/common/util/random-generator';

// 동적 multer 옵션 생성 함수
export const createMulterDiskOptions = (moduleNm: string = 'default') => ({
  storage: diskStorage({
    destination: (req, file, callback) => {
      // uploads/{moduleNm}/ 폴더 구조 생성
      const uploadPath = path.join(process.cwd(), 'uploads', moduleNm);
      console.log('📦 multer 저장 경로:', uploadPath);
      console.log('📂 moduleNm:', moduleNm);

      // 폴더가 없으면 재귀적으로 생성
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log('📁 폴더 생성됨:', uploadPath);
      }

      callback(null, uploadPath);
    },
    filename: (req, file, callback) => {
      try {
        if (!file?.originalname) {
          console.error('파일 이름 없음');
          return callback(new Error('파일 이름이 없습니다.'), '');
        }

        const decodedName = Buffer.from(file.originalname, 'latin1').toString(
          'utf8',
        );
        const ext = path.extname(decodedName);
        const base = path.basename(decodedName, ext);
        const safeBase = base.replace(/\s+/g, '-').replace(/[^\w\-가-힣]/g, '');

        const uniqueSuffix = `${generateUUID()}`;

        const safeFileName = `${safeBase}-${uniqueSuffix}${ext}`;
        callback(null, safeFileName);
      } catch (err) {
        console.error('파일 이름 생성 오류:', err);
        return callback(err, '');
      }
    },
  }),
});

export const multerDiskOptions = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      // req.body에서 moduleNm 추출 (기본값: 'default')
      console.log('🔍 req.body:', req.body); // 디버깅용
      console.log('🔍 req.body.moduleNm:', req.body?.moduleNm); // 디버깅용

      const moduleNm = req.body?.moduleNm || 'default';

      // uploads/{moduleNm}/ 폴더 구조 생성
      const uploadPath = path.join(process.cwd(), 'uploads', moduleNm);
      console.log('📦 multer 저장 경로:', uploadPath);

      // 폴더가 없으면 재귀적으로 생성
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log('📁 폴더 생성됨:', uploadPath);
      }

      callback(null, uploadPath);
    },
    filename: (req, file, callback) => {
      try {
        if (!file?.originalname) {
          console.error('파일 이름 없음');
          return callback(new Error('파일 이름이 없습니다.'), '');
        }

        const decodedName = Buffer.from(file.originalname, 'latin1').toString(
          'utf8',
        );
        const ext = path.extname(decodedName);
        const base = path.basename(decodedName, ext);
        const safeBase = base.replace(/\s+/g, '-').replace(/[^\w\-가-힣]/g, '');

        const uniqueSuffix = `${generateUUID()}`;

        const safeFileName = `${safeBase}-${uniqueSuffix}${ext}`;
        // const safeFileName = encodeURI(`${safeBase}-${uniqueSuffix}${ext}`);
        callback(null, safeFileName);
      } catch (err) {
        console.error('파일 이름 생성 오류:', err);
        return callback(err, '');
      }
    },
  }),
  // limits: { fileSize: 10 * 1024 * 1024 }, // 필요 시 제한 설정
};

// export const multerDiskOptions = {
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
//       // 이미지 형식 jpg, jpeg, png만 허용
//       cb(null, true);
//     } else {
//       cb(
//         new HttpException(
//           {
//             message: 1,
//             error: '지원하지 않는 이미지 형식',
//           },
//           HttpStatus.BAD_REQUEST,
//         ),
//         false,
//       );
//     }
//   },

//   // 디스크 저장 방식
//   storage: diskStorage({
//     destination: (req, file, cb) => {
//       const uploadPath = 'uploads';
//       if (!existsSync(uploadPath)) {
//         // upload 폴더가 존재하지 않으면 생성
//         mkdirSync(uploadPath);
//       }
//       cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//       cb(null, `${Date.now()}${extname(file.originalname)}`);
//     },
//   }),
//   limits: {
//     fieldNameSize: 200, // 필드명 사이즈 최대값 (기본값 100bytes)
//     filedSize: 1024 * 1024, // 필드 사이즈 값 설정 (기본값 1MB)
//     fields: 2, // 파일 형식이 아닌 필드의 최대 개수 (기본 값 무제한)
//     fileSize: 16777216, //multipart 형식 폼에서 최대 파일 사이즈(bytes) "16MB 설정" (기본 값 무제한)
//     files: 10, //multipart 형식 폼에서 파일 필드 최대 개수 (기본 값 무제한)
//   },
// };

// export const multerDiskDestinationOutOptions = {
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
//       // 이미지 형식은 jpg, jpeg, png만 허용합니다.
//       cb(null, true);
//     } else {
//       cb(
//         new HttpException(
//           {
//             message: 1,
//             error: '지원하지 않는 이미지 형식입니다.',
//           },
//           HttpStatus.BAD_REQUEST,
//         ),
//         false,
//       );
//     }
//   },

//   /**
//    * @description Disk 저장 방식 사용
//    *
//    * destination 옵션을 설정 하지 않으면 운영체제 시스템 임시 파일을 저정하는 기본 디렉토리를 사용합니다.
//    * filename 옵션은 폴더안에 저장되는 파일 이름을 결정합니다. (디렉토리를 생성하지 않으면 에러가 발생!! )
//    */
//   storage: diskStorage({
//     filename: (request, file, callback) => {
//       //파일 이름 설정
//       callback(null, `${Date.now()}${extname(file.originalname)}`);
//     },
//   }),
//   limits: {
//     fieldNameSize: 200, // 필드명 사이즈 최대값 (기본값 100bytes)
//     filedSize: 1024 * 1024, // 필드 사이즈 값 설정 (기본값 1MB)
//     fields: 2, // 파일 형식이 아닌 필드의 최대 개수 (기본 값 무제한)
//     fileSize: 16777216, //multipart 형식 폼에서 최대 파일 사이즈(bytes) "16MB 설정" (기본 값 무제한)
//     files: 10, //multipart 형식 폼에서 파일 필드 최대 개수 (기본 값 무제한)
//   },
// };

// /**
//  * @description Memory 저장 방식 사용
//  */
// export const multerMemoryOptions = {
//   fileFilter: (request, file, callback) => {
//     console.log('multerMemoryOptions : fileFilter');
//     if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
//       // 이미지 형식은 jpg, jpeg, png만 허용합니다.
//       callback(null, true);
//     } else {
//       callback(
//         new HttpException(
//           {
//             message: 1,
//             error: '지원하지 않는 이미지 형식입니다.',
//           },
//           HttpStatus.BAD_REQUEST,
//         ),
//         false,
//       );
//     }
//   },

//   stroage: memoryStorage(),
//   limits: {
//     fieldNameSize: 200, // 필드명 사이즈 최대값 (기본값 100bytes)
//     filedSize: 1024 * 1024, // 필드 사이즈 값 설정 (기본값 1MB)
//     fields: 2, // 파일 형식이 아닌 필드의 최대 개수 (기본 값 무제한)
//     fileSize: 16777216, //multipart 형식 폼에서 최대 파일 사이즈(bytes) "16MB 설정" (기본 값 무제한)
//     files: 10, //multipart 형식 폼에서 파일 필드 최대 개수 (기본 값 무제한)
//   },
// };

// /**
//  * @returns {String} 파일 업로드 경로
//  */
// export const uploadFileURL = (fileName): string =>
//   `http://localhost:5000/${fileName}`;
