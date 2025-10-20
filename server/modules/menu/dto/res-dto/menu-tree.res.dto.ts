import {Expose, Transform} from "class-transformer";
import {boolTransformer} from "src/common/util/transformer";

export class MenuTreeResDto {
  // @Expose() 없어도 모든 기본 프로퍼티 기본 포함되지만,
  // 안정성을 위해 사용 권장함.
  // 사용한다면 excludeExtraneousValues: true을 세 번째 인자로
  // const res = plainToInstance(PollResDto, poll, {excludeExtraneousValues: true});
  // 이렇게 넣어주어야 함.
  @Expose()
  idx: number;

  @Expose()
  menuId: string;

  @Expose()
  menuNm: string;

  @Expose()
  nodeLevel: number;

  @Expose()
  upperNode: string;

  @Transform(({value}) => boolTransformer.from(value))
  @Expose()
  isUsed: boolean;

  @Transform(({value}) => boolTransformer.from(value))
  @Expose()
  isChangeable: boolean;

  @Expose()
  @Transform(({value}) => String(value))
  seqNum: string;
}
