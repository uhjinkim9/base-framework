import {IsBoolean, IsOptional, IsString, IsUUID, MaxLength} from "class-validator";

export class SaveBoardDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SavePostDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsUUID()
  boardId: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  content: string;

  @IsString()
  authorId: string;
}

export class SaveCommentDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsUUID()
  postId: string;

  @IsString()
  content: string;

  @IsString()
  authorId: string;
}
