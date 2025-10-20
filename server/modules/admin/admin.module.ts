import {TypeOrmModule} from "@nestjs/typeorm";
import {Module} from "@nestjs/common";
import {JwtModule} from "../jwt/jwt.module";

import {AdminMenuEntity} from "./entities/admin-menu.entity";
import {EmployeeEntity} from "./entities/employee.entity";

import {AdminController} from "./controllers/admin.controller";
import {AdminMenuService} from "./services/admin-menu.service";
import {EmployeeController} from "./controllers/employee.controller";
import {EmployeeService} from "./services/employee.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminMenuEntity, EmployeeEntity]),
    JwtModule,
  ],
  controllers: [AdminController, EmployeeController],
  providers: [AdminMenuService, EmployeeService],
  exports: [TypeOrmModule, EmployeeService],
})
export class AdminModule {}
