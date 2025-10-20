import {Module} from "@nestjs/common";
import {FileService} from "./services/file.service";
import {FileController} from "./controllers/file.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AttachedFileEntity} from "./entities/attached-file.entity";

@Module({
  imports: [TypeOrmModule.forFeature([AttachedFileEntity])],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
