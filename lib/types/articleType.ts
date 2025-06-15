import { Author } from './authorType';

export type ArticleType = {
  id: number;
  title: string;
  summary: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  favorited?: boolean;
  favorites_count?: number;
  author?: Author;
  tags?: string[];
};

export interface ArticleResponse {
  article: ArticleType;
}

export interface ArticleListResponse {
  articles: ArticleType[];
  articlesCount: number;
}

export interface ArticleFavorite {
  id: number;
  article_id: number;
  user_id: string;
  created_at: string;
}

export interface ArticleTag {
  id: number;
  article_id: number;
  tag_id: number;
}
