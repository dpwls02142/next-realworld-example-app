import Router from 'next/router';
import { MouseEvent, useEffect } from 'react';
import useSWR, { mutate, trigger } from 'swr';

import SettingsForm from '../../features/profile/SettingsForm';
import checkLogin from '../../lib/utils/checkLogin';
import { getCurrentUserWithProfile } from '../../lib/utils/supabase/server';

import UserAPI from '../../lib/api/user';

function Settings({ user }) {
  const { data: currentUser } = useSWR('user', getCurrentUserWithProfile, {
    initialData: user,
  });

  const isLoggedIn = checkLogin(currentUser);

  useEffect(() => {
    if (!isLoggedIn) {
      Router.push('/');
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return null;
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

export async function getServerSideProps(context) {
  try {
    const user = await getCurrentUserWithProfile();
    return {
      props: {
        user,
      },
    };
  } catch (error) {
    return {
      props: {
        user: null,
      },
    };
  }
}
export default Settings;
