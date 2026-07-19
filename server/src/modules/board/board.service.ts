import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {SaveBoardDto, SaveCommentDto, SavePostDto} from "./dto/board.dto";
import {BoardEntity} from "./entities/board.entity";
import {CommentEntity} from "./entities/comment.entity";
import {PostEntity} from "./entities/post.entity";

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(BoardEntity) private readonly boards: Repository<BoardEntity>,
    @InjectRepository(PostEntity) private readonly posts: Repository<PostEntity>,
    @InjectRepository(CommentEntity) private readonly comments: Repository<CommentEntity>,
  ) {}

  listBoards() {
    return this.boards.find({where: {isActive: true}, order: {createdAt: "ASC"}});
  }

  async saveBoard(dto: SaveBoardDto) {
    return this.boards.save(this.boards.create(dto));
  }

  async listPosts(boardId: string, page = 1, pageSize = 20) {
    const [items, total] = await this.posts.findAndCount({
      where: {board: {id: boardId}},
      relations: {board: true},
      order: {createdAt: "DESC"},
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {items, total, page, pageSize};
  }

  async getPost(id: string) {
    const post = await this.posts.findOne({where: {id}, relations: {board: true}});
    if (!post) throw new NotFoundException("Post not found");
    return post;
  }

  async savePost(dto: SavePostDto) {
    const board = await this.boards.findOneBy({id: dto.boardId});
    if (!board) throw new NotFoundException("Board not found");
    return this.posts.save(this.posts.create({...dto, board}));
  }

  async removePost(id: string) {
    await this.posts.delete(id);
    return {id};
  }

  listComments(postId: string) {
    return this.comments.find({where: {post: {id: postId}}, order: {createdAt: "ASC"}});
  }

  async saveComment(dto: SaveCommentDto) {
    const post = await this.posts.findOneBy({id: dto.postId});
    if (!post) throw new NotFoundException("Post not found");
    return this.comments.save(this.comments.create({...dto, post}));
  }
}
