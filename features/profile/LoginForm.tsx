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
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'password') {
      setIsPasswordValid(value.length === 0 || value.length >= 6);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await UserAPI.login(formData.email, formData.password);

      if (data?.user) {
        mutate('user', data?.user);
        Router.push('/');
      } else {
        setErrors(['로그인 정보가 올바르지 않습니다.']);
      }
    } catch (error) {
      console.error('Login failed:', error);
      if (error.message) {
        setErrors([error.message]);
      } else {
        setErrors(['로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.']);
      }
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
              required
            />
          </fieldset>

          <fieldset className="form-group">
            <label htmlFor="login-password">비밀번호</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                className="form-control form-control-lg"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
              <i
                className={showPassword ? 'ion-eye-disabled' : 'ion-eye'}
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#999',
                }}
              />
              {!isPasswordValid && (
                <div
                  style={{
                    color: 'red',
                    fontSize: '0.875rem',
                    marginTop: '0.25rem',
                  }}
                >
                  비밀번호는 최소 6자 이상이어야 합니다.
                </div>
              )}
            </div>
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
