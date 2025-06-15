import Router from 'next/router';
import { MouseEvent } from 'react';
import useSWR, { mutate, trigger } from 'swr';

import SettingsForm from '../../features/profile/SettingsForm';
import checkLogin from '../../lib/utils/checkLogin';
import { getCurrentUser } from '../../lib/utils/supabase/client';
import UserAPI from '../../lib/api/user';

function Settings({ res }) {
  const { data: currentUser } = useSWR('user', getCurrentUser);
  const isLoggedIn = checkLogin(currentUser);

  if (!isLoggedIn) {
    if (res) {
      res.writeHead(302, {
        Location: '/',
      });
      res.end();
    }
    Router.push(`/`);
  }

  async function handleLogout(e: MouseEvent) {
    e.preventDefault();
    try {
      await UserAPI.logout();
      mutate('user', null);
      await Router.push('/');
      trigger('user');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  }

  return (
    <div className="settings-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Your Settings</h1>
            <SettingsForm />
            <hr />
            <button className="btn btn-outline-danger" onClick={handleLogout}>
              Or click here to logout.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Settings.getInitialProps = async ({ res }) => {
  return {
    res,
  };
};

export default Settings;
