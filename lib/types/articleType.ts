export interface ArticleList {
  articles: ArticleType[];
}

export interface Article {
  article: ArticleType;
}

export interface ArticleBannerProps {
  title: string;
  article: Article;
}

export interface ArticleBodyProps {
  htmlContent: { __html: string };
  tags: string[];
}

export interface ArticlePageProps {
  initialArticle: { article: Article };
}

export type ArticleType = {
  tagList: string[];
  createdAt: number;
  author: Author;
  description: string;
  title: string;
  body: string;
  slug: string;
  updatedAt: number;
  favoritesCount: number;
  favorited: boolean;
};

export type Author = {
  username: string;
  bio: string;
  image: string;
  following: boolean;
};
