import marked from 'marked';
import { useRouter } from 'next/router';
import React from 'react';
import useSWR from 'swr';

import ArticleMeta from '../../features/article/ArticleMeta';
import CommentList from '../../features/comment/CommentList';
import ArticleAPI from '../../lib/api/article';
import { Article } from '../../lib/types/articleType';
import { SERVER_BASE_URL } from '../../lib/utils/constant';
import fetcher from '../../lib/utils/fetcher';

interface ArticleBannerProps {
  title: string;
  article: Article;
}

interface ArticleBodyProps {
  htmlContent: { __html: string };
  tags: string[];
}

interface ArticlePageProps {
  initialArticle: { article: Article };
}

function ArticleBanner({ title, article }: ArticleBannerProps) {
  return (
    <div className="banner">
      <div className="container">
        <h1>{title}</h1>
        <ArticleMeta article={article} />
      </div>
    </div>
  );
}

function ArticleBody({ htmlContent, tags }: ArticleBodyProps) {
  return (
    <div className="row article-content">
      <div className="col-xs-12">
        <div dangerouslySetInnerHTML={htmlContent} />
        <ul className="tag-list">
          {tags.map((tag) => (
            <li key={tag} className="tag-default tag-pill tag-outline">
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CommentsSection() {
  return (
    <div className="row">
      <div className="col-xs-12 col-md-8 offset-md-2">
        <CommentList />
      </div>
    </div>
  );
}

function ArticlePage({ initialArticle }: ArticlePageProps) {
  const router = useRouter();
  const {
    query: { slug },
  } = router;

  const { data: fetchedArticle } = useSWR(
    `${SERVER_BASE_URL}/articles/${encodeURIComponent(String(slug))}`,
    fetcher,
    { initialData: initialArticle },
  );

  const articleData = fetchedArticle || initialArticle;
  const { article } = articleData;

  const htmlContent = {
    __html: marked(article.body, { sanitize: true }),
  };

  return (
    <div className="article-page">
      <ArticleBanner title={article.title} article={article} />

      <div className="container page">
        <ArticleBody htmlContent={htmlContent} tags={article.tagList} />

        <hr />
        <div className="article-actions" />

        <CommentsSection />
      </div>
    </div>
  );
}

ArticlePage.getInitialProps = async ({ query: { slug } }) => {
  const { data } = await ArticleAPI.get(slug);
  return data;
};

export default ArticlePage;
