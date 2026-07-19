import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {BoardController} from "./board.controller";
import {BoardService} from "./board.service";
import {BoardEntity} from "./entities/board.entity";
import {CommentEntity} from "./entities/comment.entity";
import {PostEntity} from "./entities/post.entity";

@Module({
  imports: [TypeOrmModule.forFeature([BoardEntity, PostEntity, CommentEntity])],
  controllers: [BoardController],
  providers: [BoardService],
  exports: [BoardService],
})
export class BoardModule {}
