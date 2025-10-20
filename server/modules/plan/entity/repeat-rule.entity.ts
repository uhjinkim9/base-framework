import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";
import {RepeatEndTypes, RepeatTypes} from "../etc/plan.enum";

@Entity("repeat_rules")
export class RepeatRuleEntity {
  @PrimaryGeneratedColumn({name: "idx", type: "int"})
  idx: number;

  @Column({name: "plan_idx", type: "int"})
  planIdx: number;

  @Column({
    name: "freq",
    type: "enum",
    enum: RepeatTypes,
    nullable: true,
  })
  freq: RepeatTypes;

  @Column({name: "interval", type: "int", nullable: true})
  interval: number;

  @Column({name: "byweekday", type: "varchar", nullable: true})
  byweekday: string; // 콤마로 구분된 문자열 (ex: 'MO,TU,FR')

  @Column({name: "bymonthday", type: "varchar", nullable: true})
  bymonthday: string; // 콤마로 구분된 문자열 (ex: '1,15,-1')

  @Column({name: "bymonth", type: "varchar", nullable: true})
  bymonth: string; // 콤마로 구분된 문자열 (ex: '1,6,12')

  @Column({name: "byyearday", type: "varchar", nullable: true})
  byyearday: string; // 콤마로 구분된 문자열 (ex: '100,200')

  @Column({name: "bysetpos", type: "int", nullable: true})
  bysetpos: number; // 정렬된 결과 중 몇 번째 (ex: 1, 2, -1)

  @Column({name: "dtstart", type: "varchar", nullable: true})
  dtstart: string; // 반복 시작일 (YYYY-MM-DD)

  @Column({name: "until", type: "varchar", nullable: true})
  until: string; // 반복 종료일 (YYYY-MM-DD)

  @Column({name: "count", type: "int", nullable: true})
  count: number; // 반복 횟수 제한

  @Column({
    name: "repeat_end_type",
    type: "enum",
    enum: RepeatEndTypes,
    nullable: true,
  })
  repeatEndType: RepeatEndTypes; // 종료 유형 (횟수, 날짜, 무한)
}
