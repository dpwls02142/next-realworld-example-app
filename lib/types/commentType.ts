import { Author } from './authorType';

export interface Comments {
  comments: CommentType[];
}

export type CommentType = {
  id: number;
  content: string;
  article_id: number;
  author_id: string;
  created_at: string;
  updated_at: string;
  user_profiles: Author;
};
