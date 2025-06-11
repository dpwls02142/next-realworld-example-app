import axios from 'axios';
import Link from 'next/link';
import Router from 'next/router';
import { useState } from 'react';
import useSWR from 'swr';

import CustomLink from '../../shared/components/CustomLink';
import ArticleMeta from '../../features/article/ArticleMeta';
import { usePageDispatch } from '../../lib/context/PageContext';
import checkLogin from '../../lib/utils/checkLogin';
import { SERVER_BASE_URL } from '../../lib/utils/constant';
import storage from '../../lib/utils/storage';
import { ArticleType } from '../../lib/types/articleType';

type ArticleProps = {
  article: ArticleType;
};

const ArticlePreview = ({ article }: ArticleProps) => {
  const setPage = usePageDispatch();
  const [preview, setPreview] = useState(article);
  const [hover, setHover] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const { data: currentUser } = useSWR('user', storage);
  const isLoggedIn = checkLogin(currentUser);

  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      Router.push('/user/login');
      return;
    }

    const nextFavorited = !preview.favorited;
    const nextFavoritesCount = nextFavorited
      ? preview.favoritesCount + 1
      : preview.favoritesCount - 1;

    setPreview({
      ...preview,
      favorited: nextFavorited,
      favoritesCount: nextFavoritesCount,
    });

    const config = {
      headers: { Authorization: `Token ${currentUser?.token}` },
    };

    try {
      const url = `${SERVER_BASE_URL}/articles/${preview.slug}/favorite`;
      nextFavorited
        ? await axios.post(url, {}, config)
        : await axios.delete(url, config);
    } catch {
      setPreview({
        ...preview,
        favorited: !nextFavorited,
        favoritesCount: preview.favoritesCount,
      });
    }
  };

  return (
    <div className="article-preview" style={{ padding: '1.5rem 0.5rem' }}>
      <div
        className="article-meta-wrapper"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <ArticleMeta article={preview} showActions={false} />
        <div className="pull-xs-right">
          <button
            className={
              preview.favorited
                ? 'btn btn-sm btn-primary'
                : 'btn btn-sm btn-outline-primary'
            }
            onClick={toggleFavorite}
          >
            <i className="ion-heart" /> {preview.favoritesCount}
          </button>
        </div>
      </div>

      <CustomLink
        href="/article/[pid]"
        as={`/article/${preview.slug}`}
        className="preview-link"
      >
        <h1>{preview.title}</h1>
        <p>{preview.description}</p>
        <span>Read more...</span>
        <ul className="tag-list" style={{ maxWidth: '100%' }}>
          {preview.tagList.map((tag, index) => (
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
