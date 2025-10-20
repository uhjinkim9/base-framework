import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {PlansController} from "./controller/plans.controller";
import {PlanService} from "./service/plan.service";

import {PlanEntity} from "./entity/plan.entity";
import {ScheduleEntity} from "./entity/schedule.entity";
import {TaskEntity} from "./entity/task.entity";
import {DayoffEntity} from "./entity/dayoff.entity";
import {RepeatRuleEntity} from "./entity/repeat-rule.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DayoffEntity,
      PlanEntity,
      ScheduleEntity,
      TaskEntity,
      RepeatRuleEntity,
    ]),
  ],
  controllers: [PlansController],
  providers: [PlanService],
})
export class PlansModule {}
