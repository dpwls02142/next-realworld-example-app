export type ArticleType = {
  description: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Author;
  tagList: string[];
  slug: string;
  title: string;
};

export type Author = {
  following: boolean;
  bio: string | null;
  image: string;
  username: string;
};

export interface ArticleResponse {
  article: ArticleType;
}

export interface ArticleListResponse {
  articles: ArticleType[];
  articlesCount: number;
}
