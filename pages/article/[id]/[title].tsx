import ArticleMeta from '../../../features/article/ArticleMeta';
import CommentList from '../../../features/comment/CommentList';
import ArticleAPI from '../../../lib/api/article';
import { ArticleType } from '../../../lib/types/articleType';

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
    __html: article.content,
  };

  return (
    <div className="row article-content">
      <div className="col-xs-12">
        <div dangerouslySetInnerHTML={htmlContent} />
        <ul className="tag-list">
          {(article.tags || []).map((tag) => (
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

function ArticlePage({ article }: { article: ArticleType }) {
  return (
    <div className="article-page">
      <ArticleBanner article={article} />
      <div className="container page">
        <ArticleBody article={article} />
        <hr />
        <CommentsSection />
      </div>
    </div>
  );
}

export async function getServerSideProps({ query, res }) {
  const { id } = query;

  if (!id || isNaN(Number(id))) {
    res.writeHead(302, { Location: '/404' });
    res.end();
    return { props: {} };
  }

  try {
    const {
      data: { article },
    } = await ArticleAPI.get(id);
    if (!article) {
      res.writeHead(302, { Location: '/404' });
      res.end();
      return { props: {} };
    }
    return {
      props: {
        article: article,
      },
    };
  } catch (error) {
    res.writeHead(302, { Location: '/404' });
    res.end();
    return { props: {} };
  }
}

export default ArticlePage;
