import React from 'react';
import { useRouter } from 'next/router';

import CustomLink from '../../shared/components/CustomLink';
import { usePageDispatch } from '../../lib/context/PageContext';

const ProfileTab = ({ profile }) => {
  const setPage = usePageDispatch();
  const router = useRouter();
  const {
    query: { favorite },
  } = router;
  const encodedUsername = encodeURIComponent(profile.username);

  return (
    <ul className="nav nav-pills outline-active">
      <li className="nav-item">
        <CustomLink
          href="/profile/[pid]"
          as={`/profile/${encodedUsername}`}
          className={`nav-link ${!favorite ? 'active' : ''}`}
        >
          <span onClick={() => setPage(0)}>My Articles</span>
        </CustomLink>
      </li>
      <li className="nav-item">
        <CustomLink
          href="/profile/[pid]?favorite=true"
          as={`/profile/${encodedUsername}?favorite=true`}
          className={`nav-link ${favorite ? 'active' : ''}`}
        >
          <span onClick={() => setPage(0)}>Favorited Articles</span>
        </CustomLink>
      </li>
    </ul>
  );
};

export default ProfileTab;
