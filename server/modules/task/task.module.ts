import {Module} from "@nestjs/common";
import {ScheduleModule} from "@nestjs/schedule";
import {TaskService} from "./task.service";
import {TaskController} from "./task.controller";

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
