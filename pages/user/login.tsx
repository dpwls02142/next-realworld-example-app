import Head from 'next/head';
import React from 'react';

import CustomLink from '../../shared/components/CustomLink';
import LoginForm from '../../features/profile/LoginForm';

function Login() {
  return (
    <div>
      <Head>
        <title>LOGIN | NEXT REALWORLD</title>
        <meta
          name="description"
          content="Please login to use fully-featured next-realworld site. (Post articles, comments, and like, follow etc.)"
        />
      </Head>
      <div className="auth-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-6 offset-md-3 col-xs-12">
              <h1 className="text-xs-center">Sign in</h1>
              <p className="text-xs-center">
                <CustomLink href="/user/register" as="/user/register">
                  Need an account?
                </CustomLink>
              </p>
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
