import Link from 'next/link';
import Router from 'next/router';
import { useState } from 'react';
import useSWR from 'swr';

import CustomLink from '../../shared/components/CustomLink';
import ArticleMeta from '../../features/article/ArticleMeta';
import { usePageDispatch } from '../../lib/context/PageContext';
import checkLogin from '../../lib/utils/checkLogin';
import { getCurrentUser } from '../../lib/utils/supabase/client';
import { ArticleType } from '../../lib/types/articleType';
import { useFavoriteMutation } from '../../lib/hooks/useFavorite';

type ArticleProps = {
  article: ArticleType;
};

const ArticlePreview = ({ article }: ArticleProps) => {
  const setPage = usePageDispatch();
  const [preview, setPreview] = useState(article);
  const [hover, setHover] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const { data: currentUser } = useSWR('user', getCurrentUser);
  const isLoggedIn = checkLogin(currentUser);
  const favoriteMutation = useFavoriteMutation();

  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      Router.push('/user/login');
      return;
    }

    const currentFavorited = preview.favorited;
    const currentCount = preview.favorites_count || 0;
    const nextFavorited = !currentFavorited;
    const nextFavoritesCount = nextFavorited
      ? currentCount + 1
      : currentCount - 1;

    setPreview({
      ...preview,
      favorited: nextFavorited,
      favorites_count: nextFavoritesCount,
    });

    favoriteMutation.mutate(
      {
        articleId: preview.id.toString(),
        isFavorited: currentFavorited,
      },
      {
        onError: () => {
          setPreview({
            ...preview,
            favorited: currentFavorited,
            favorites_count: currentCount,
          });
        },
      },
    );
  };

  return (
    <div className="article-preview" style={{ padding: '1.5rem 0.5rem' }}>
      <div className="article-meta-wrapper">
        <ArticleMeta article={preview} showActions={false} />
        <div className="pull-xs-right">
          <button
            className={
              preview.favorited
                ? 'btn btn-sm btn-primary'
                : 'btn btn-sm btn-outline-primary'
            }
            onClick={toggleFavorite}
            disabled={favoriteMutation.isLoading}
          >
            <i className="ion-heart" /> {preview.favorites_count || 0}
          </button>
        </div>
      </div>

      <CustomLink
        href="/article/[id]/[title]"
        as={`/article/${preview.id}/${encodeURIComponent(preview.title)}`}
        className="preview-link"
      >
        <h1>{preview.title}</h1>
        <p>{preview.summary}</p>
        <span>Read more...</span>
        <ul className="tag-list" style={{ maxWidth: '100%' }}>
          {(preview.tags || []).map((tag, index) => (
            <Link
              href={`/?tag=${tag}`}
              as={`/?tag=${tag}`}
              key={index}
              passHref
            >
              <li
                className="tag-default tag-pill tag-outline"
                onClick={(e) => e.stopPropagation()}
                onMouseOver={() => {
                  setHover(true);
                  setCurrentIndex(index);
                }}
                onMouseLeave={() => {
                  setHover(false);
                  setCurrentIndex(-1);
                }}
                style={{
                  borderColor:
                    hover && currentIndex === index ? '#5cb85c' : 'initial',
                }}
              >
                <span
                  style={{
                    color:
                      hover && currentIndex === index ? '#5cb85c' : 'inherit',
                  }}
                  onClick={() => setPage(0)}
                >
                  {tag}
                </span>
              </li>
            </Link>
          ))}
        </ul>
      </CustomLink>
    </div>
  );
};

export default ArticlePreview;
