/**
 * @fileoverview 비밀번호 해시화/검증 유틸리티 모듈
 * @module password
 *
 * @author 김어진
 */

import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const password = {
  /**
   * 비밀번호 해시화 함수
   * @param pw 가입 시 입력되는 비밀번호
   * @returns 해시화된 비밀번호
   */
  toHash: async (pw: string): Promise<string> => {
    const salt = randomBytes(8).toString('hex');
    const buf = (await scryptAsync(pw, salt, 64)) as Buffer;

    return `${buf.toString('hex')}.${salt}`;
  },

  /**
   * 비밀번호 검증 함수
   * @param storedPw DB에 저장된 해시 비밀번호
   * @param suppliedPw 입력된 비밀번호
   * @returns 비밀번호 일치 여부
   */
  compare: async (storedPw: string, suppliedPw: string): Promise<boolean> => {
    const [hashedPw, salt] = storedPw.split('.');
    const buf = (await scryptAsync(suppliedPw, salt, 64)) as Buffer;

    return buf.toString('hex') === hashedPw;
  },
};

// password.toHash('1234').then((h) => {
//   console.log(h);
// });

// password
//   .compare(
//     'fa2acea7fcc04ddefab39415ced36e02b73f30352e74dad8ab0307c88e9d0c38ccdbaab168d7681b41148685778327d7a7481e733ab89730d9db0ca4b0fb5556.7a1d6daf2d937965',
//     '1234',
//   )
//   .then((h) => {
//     console.log('비밀번호 비교', h);
//   });

export default password;
