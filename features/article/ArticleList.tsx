import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useSWR from 'swr';

import ArticlePreview from './ArticlePreview';
import ErrorMessage from '../../shared/components/ErrorMessage';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import Maybe from '../../shared/components/Maybe';
import Pagination from '../../shared/components/Pagination';
import { usePageState } from '../../lib/context/PageContext';
import {
  usePageCountState,
  usePageCountDispatch,
} from '../../lib/context/PageCountContext';
import useViewport from '../../lib/hooks/useViewport';
import { DEFAULT_LIMIT } from '../../lib/utils/constant';
import ArticleAPI from '../../lib/api/article';

const PAGINATION_THRESHOLD = 20;
const MAX_PAGE_COUNT = 480;
const DESKTOP_PAGE_COUNT = 10;
const MOBILE_PAGE_COUNT = 5;
const DESKTOP_BREAKPOINT = 768;

const ERROR_MESSAGES = {
  LOAD_ARTICLES: 'Cannot load recent articles...',
  NO_ARTICLES: 'No articles are here... yet.',
};

const ArticleList = () => {
  const page = usePageState();
  const pageCount = usePageCountState();
  const setPageCount = usePageCountDispatch();
  const { vw } = useViewport();
  const router = useRouter();
  const { pathname, query } = router;
  const { favorite, follow, tag, pid } = query;

  const isProfilePage = pathname.startsWith('/profile');
  const isTagPage = !!tag;
  const isFavoritePage = isProfilePage && !!favorite;
  const isAuthorPage = isProfilePage && !favorite;
  const isFeedPage = !isProfilePage && !!follow;

  function calculateLastIndex(totalCount: number) {
    const maxPages =
      totalCount > MAX_PAGE_COUNT
        ? Math.ceil(MAX_PAGE_COUNT / PAGINATION_THRESHOLD)
        : Math.ceil(totalCount / PAGINATION_THRESHOLD);
    return Math.max(0, maxPages - 1);
  }

  const lastIndex = calculateLastIndex(pageCount);

  function buildFetchKey() {
    if (isTagPage) {
      return ['articles', 'tag', tag, page];
    }

    if (isFavoritePage) {
      return ['articles', 'favorited', pid, page];
    }

    if (isAuthorPage) {
      return ['articles', 'author', pid, page];
    }

    if (isFeedPage) {
      return ['articles', 'feed', page];
    }

    return ['articles', 'all', page];
  }

  async function fetchArticles() {
    if (isTagPage) {
      return await ArticleAPI.byTag(String(tag), page);
    }

    if (isFavoritePage) {
      return await ArticleAPI.favoritedBy(String(pid), page);
    }

    if (isAuthorPage) {
      return await ArticleAPI.byAuthor(String(pid), page, DEFAULT_LIMIT);
    }

    if (isFeedPage) {
      return await ArticleAPI.feed(page);
    }

    return await ArticleAPI.all(page);
  }

  const fetchKey = buildFetchKey();
  const { data, error } = useSWR(fetchKey, fetchArticles);

  useEffect(() => {
    if (data?.data?.articlesCount) {
      setPageCount(data.data.articlesCount);
    }
  }, [data?.data?.articlesCount, setPageCount]);

  const articles = data?.data?.articles || [];
  const articlesCount = data?.data?.articlesCount || 0;

  if (error) {
    return (
      <div className="col-md-9">
        <div className="feed-toggle">
          <ul className="nav nav-pills outline-active"></ul>
        </div>
        <ErrorMessage message={ERROR_MESSAGES.LOAD_ARTICLES} />
      </div>
    );
  }

  if (!data) return <LoadingSpinner />;

  if (articles.length === 0) {
    return <div className="article-preview">{ERROR_MESSAGES.NO_ARTICLES}</div>;
  }

  const shouldShowPagination =
    articlesCount && articlesCount > PAGINATION_THRESHOLD;
  const paginationPageCount =
    vw >= DESKTOP_BREAKPOINT ? DESKTOP_PAGE_COUNT : MOBILE_PAGE_COUNT;

  return (
    <>
      {articles?.map((article) => (
        <ArticlePreview key={article.id} article={article} />
      ))}

      <Maybe test={shouldShowPagination}>
        <Pagination
          total={articlesCount}
          limit={PAGINATION_THRESHOLD}
          pageCount={paginationPageCount}
          currentPage={page}
          lastIndex={lastIndex}
          fetchURL=""
        />
      </Maybe>
    </>
  );
};

export default ArticleList;
