import marked from 'marked';
import { useRouter } from 'next/router';
import React from 'react';
import useSWR from 'swr';

import ArticleMeta from '../../features/article/ArticleMeta';
import CommentList from '../../features/comment/CommentList';
import ArticleAPI from '../../lib/api/article';
import { ArticleType, ArticleResponse } from '../../lib/types/articleType';
import { SERVER_BASE_URL } from '../../lib/utils/constant';
import fetcher from '../../lib/utils/fetcher';

function ArticleBanner({ article }: { article: ArticleType }) {
  return (
    <div className="banner">
      <div className="container">
        <h1>{article.title}</h1>
        <ArticleMeta article={article} />
      </div>
    </div>
  );
}

function ArticleBody({ article }: { article: ArticleType }) {
  const htmlContent = {
    __html: marked(article.body, { sanitize: true }),
  };

  return (
    <div className="row article-content">
      <div className="col-xs-12">
        <div dangerouslySetInnerHTML={htmlContent} />
        <ul className="tag-list">
          {article.tagList.map((tag) => (
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

function ArticlePage({ initialArticle }: { initialArticle: ArticleResponse }) {
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
  if (!articleData) return <div>데이터 없음</div>;

  return (
    <div className="article-page">
      <ArticleBanner article={articleData.article} />

      <div className="container page">
        <ArticleBody article={articleData.article} />

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
