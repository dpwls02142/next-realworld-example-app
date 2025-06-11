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
import { SERVER_BASE_URL, DEFAULT_LIMIT } from '../../lib/utils/constant';
import fetcher from '../../lib/utils/fetcher';

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
  const { asPath, pathname, query } = router;
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

  function buildFetchURL() {
    const baseOffset = page * DEFAULT_LIMIT;

    if (isTagPage) {
      return `${SERVER_BASE_URL}/articles${asPath}&offset=${baseOffset}`;
    }

    if (isFavoritePage) {
      return `${SERVER_BASE_URL}/articles?favorited=${encodeURIComponent(
        String(pid),
      )}&offset=${baseOffset}`;
    }

    if (isAuthorPage) {
      return `${SERVER_BASE_URL}/articles?author=${encodeURIComponent(
        String(pid),
      )}&offset=${baseOffset}`;
    }

    if (isFeedPage) {
      return `${SERVER_BASE_URL}/articles/feed?offset=${baseOffset}`;
    }

    return `${SERVER_BASE_URL}/articles?offset=${baseOffset}`;
  }

  const fetchURL = buildFetchURL();
  const { data, error } = useSWR(fetchURL, fetcher);

  useEffect(() => {
    if (data?.articlesCount) {
      setPageCount(data.articlesCount);
    }
  }, [data?.articlesCount, setPageCount]);

  const { articles = [], articlesCount = 0 } = data || {};

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
        <ArticlePreview key={article.slug} article={article} />
      ))}

      <Maybe test={shouldShowPagination}>
        <Pagination
          total={articlesCount}
          limit={PAGINATION_THRESHOLD}
          pageCount={paginationPageCount}
          currentPage={page}
          lastIndex={lastIndex}
          fetchURL={fetchURL}
        />
      </Maybe>
    </>
  );
};

export default ArticleList;
