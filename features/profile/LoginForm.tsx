import Router from 'next/router';
import React, { useState } from 'react';
import { mutate } from 'swr';

import ListErrors from '../../shared/components/ListErrors';
import UserAPI from '../../lib/api/user';

type FormData = {
  email: string;
  password: string;
};

const LoginForm = () => {
  const [isLoading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, status } = await UserAPI.login(
        formData.email,
        formData.password,
      );
      if (status !== 200) {
        setErrors(data.errors);
      }

      if (data?.user) {
        window.localStorage.setItem('user', JSON.stringify(data.user));
        mutate('user', data?.user);
        Router.push('/');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListErrors errors={errors} />

      <form onSubmit={handleSubmit}>
        <fieldset>
          <fieldset className="form-group">
            <label htmlFor="login-email">이메일</label>
            <input
              id="login-email"
              className="form-control form-control-lg"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </fieldset>

          <fieldset className="form-group">
            <label htmlFor="login-password">비밀번호</label>
            <input
              id="login-password"
              className="form-control form-control-lg"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
            />
          </fieldset>

          <button
            className="btn btn-lg btn-primary pull-xs-right"
            type="submit"
            disabled={isLoading}
          >
            Sign in
          </button>
        </fieldset>
      </form>
    </>
  );
};

export default LoginForm;
