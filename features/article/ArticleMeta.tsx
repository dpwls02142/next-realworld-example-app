import React from 'react';

import ArticleActions from '../../features/article/ArticleActions';
import CustomImage from '../../shared/components/CustomImage';
import CustomLink from '../../shared/components/CustomLink';
import { ArticleType } from 'lib/types/articleType';

const ArticleMeta = ({
  article,
  showActions = true,
}: {
  article: ArticleType;
  showActions?: boolean;
}) => {
  if (!article) return null;

  return (
    <div className="article-meta">
      <CustomLink
        href="/profile/[pid]"
        as={`/profile/${encodeURIComponent(article.author?.username)}`}
      >
        <CustomImage src={article.author?.image} alt="author-profile-image" />
      </CustomLink>

      <div className="info">
        <CustomLink
          href="/profile/[pid]"
          as={`/profile/${encodeURIComponent(article.author?.username)}`}
          className="author"
        >
          {article.author?.username}
        </CustomLink>
        <span className="date">
          {new Date(article.createdAt).toDateString()}
        </span>
      </div>

      {/* 수정/삭제 버튼은 showActions가 true일 때만 보이도록 */}
      {showActions && <ArticleActions article={article} />}
    </div>
  );
};

export default ArticleMeta;
