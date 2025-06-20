import { useCallback } from 'react';
import useSWR from 'swr';

import CustomLink from '../../components/CustomLink';
import Maybe from '../../components/Maybe';
import NavLink from './NavLink';
import { usePageDispatch } from '../../../lib/context/PageContext';
import checkLogin from '../../../lib/utils/checkLogin';
import { getCurrentUser } from '../../../lib/utils/supabase/client';
import { useFollowersCount } from '../../../lib/hooks/useFollow';

const Navbar = () => {
  const setPage = usePageDispatch();
  const { data: currentUser } = useSWR('user', getCurrentUser);
  const isLoggedIn = checkLogin(currentUser);

  const { data: followersCount } = useFollowersCount(currentUser?.id);

  const handleClick = useCallback(() => setPage(0), []);

  return (
    <nav className="navbar navbar-light navbar-fixe">
      <div className="container">
        <CustomLink className="navbar-brand" href="/" as="/">
          <span onClick={handleClick}>conduit</span>
        </CustomLink>
        <ul className="nav navbar-nav pull-xs-right">
          <li className="nav-item">
            <NavLink href="/" as="/">
              <span onClick={handleClick}>Home</span>
            </NavLink>
          </li>
          <Maybe test={isLoggedIn}>
            <li className="nav-item">
              <NavLink href="/editor/new" as="/editor/new">
                <i className="ion-compose" />
                &nbsp;New Post
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink href="/user/settings" as="/user/settings">
                <i className="ion-gear-a" />
                &nbsp;Settings
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                href={`/profile/${currentUser?.username}`}
                as={`/profile/${currentUser?.username}`}
              >
                <span onClick={handleClick}>
                  {currentUser?.username}
                  {followersCount !== undefined && (
                    <span className="followers-count">
                      {' '}
                      (팔로워 {followersCount} 명)
                    </span>
                  )}
                </span>
              </NavLink>
            </li>
          </Maybe>
          <Maybe test={!isLoggedIn}>
            <li className="nav-item">
              <NavLink href="/user/login" as="/user/login">
                Sign in
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink href="/user/register" as="/user/register">
                Sign up
              </NavLink>
            </li>
          </Maybe>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
