import {Body, Controller, Delete, Get, Param, Post, Query} from "@nestjs/common";
import {BoardService} from "./board.service";
import {SaveBoardDto, SaveCommentDto, SavePostDto} from "./dto/board.dto";

@Controller("board")
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  listBoards() {
    return this.boardService.listBoards();
  }

  @Post()
  saveBoard(@Body() dto: SaveBoardDto) {
    return this.boardService.saveBoard(dto);
  }

  @Get(":boardId/posts")
  listPosts(
    @Param("boardId") boardId: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    return this.boardService.listPosts(boardId, Number(page ?? 1), Number(pageSize ?? 20));
  }

  @Get("posts/:id")
  getPost(@Param("id") id: string) {
    return this.boardService.getPost(id);
  }

  @Post("posts")
  savePost(@Body() dto: SavePostDto) {
    return this.boardService.savePost(dto);
  }

  @Delete("posts/:id")
  removePost(@Param("id") id: string) {
    return this.boardService.removePost(id);
  }

  @Get("posts/:postId/comments")
  listComments(@Param("postId") postId: string) {
    return this.boardService.listComments(postId);
  }

  @Post("comments")
  saveComment(@Body() dto: SaveCommentDto) {
    return this.boardService.saveComment(dto);
  }
}
