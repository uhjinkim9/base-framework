import { HttpStatus } from '@nestjs/common';

export class Result<T> {
  statusCode: HttpStatus;
  message: string;
  data?: T;

  constructor(partial: Partial<Result<T>>) {
    Object.assign(this, partial);
  }

  static success<T>(data: T, message = '성공'): Result<T> {
    return new Result({
      statusCode: HttpStatus.OK,
      message,
      data,
    });
  }

  static error(statusCode: HttpStatus, message: string): Result<null> {
    return new Result({
      statusCode,
      message,
      data: null,
    });
  }
}
