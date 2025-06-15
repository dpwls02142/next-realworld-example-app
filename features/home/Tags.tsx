import React from 'react';

import CustomLink from '../../shared/components/CustomLink';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import { usePageDispatch } from '../../lib/context/PageContext';
import useSWR from 'swr';
import TagAPI from '../../lib/api/tag';
import ErrorMessage from '../../shared/components/ErrorMessage';

const Tags = () => {
  const setPage = usePageDispatch();
  const handleClick = React.useCallback(() => setPage(0), []);
  const { data, error } = useSWR('tags', () => TagAPI.getPopular(10));

  if (error) return <ErrorMessage message="Cannot load popular tags..." />;
  if (!data) return <LoadingSpinner />;

  const tags = data?.data?.tags || [];
  return (
    <div className="tag-list">
      {tags?.map((tag) => (
        <CustomLink
          key={tag}
          href={`/?tag=${tag}`}
          as={`/?tag=${tag}`}
          className="tag-default tag-pill"
        >
          <span onClick={handleClick}>{tag}</span>
        </CustomLink>
      ))}
    </div>
  );
};

export default Tags;
