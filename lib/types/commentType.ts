import { Author } from './authorType';

export interface Comments {
  comments: CommentType[];
}

export type CommentType = {
  id: string;
  author: Author;
  body: string;
  createdAt: number;
  updatedAt: number;
};
