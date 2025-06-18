import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import ListErrors from '../../shared/components/ListErrors';
import checkLogin from '../../lib/utils/checkLogin';
import { getCurrentUser } from '../../lib/utils/supabase/client';
import UserAPI from '../../lib/api/user';

type UserSettingsData = {
  image: string;
  username: string;
  bio: string;
  email: string;
  password: string;
};

const SettingsForm = () => {
  const router = useRouter();
  const { data: currentUser } = useSWR('user', getCurrentUser);
  const isLoggedIn = checkLogin(currentUser);
  const [isLoading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [userInfo, setUserInfo] = useState<UserSettingsData>({
    image: '',
    username: '',
    bio: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      setUserInfo((prev) => ({
        ...prev,
        email: currentUser.email || '',
        username: currentUser.user_metadata?.username || '',
        bio: currentUser.user_metadata?.bio || '',
        image: currentUser.user_metadata?.image || '',
        password: '',
      }));
    }
  }, [isLoggedIn, currentUser]);

  const handleInputChange = (field: keyof UserSettingsData, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
    if (field === 'password') {
      setIsPasswordValid(value.length === 0 || value.length >= 6);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const userPayload = { ...userInfo };

      if (!userPayload.password) {
        delete userPayload.password;
      }

      console.log('Submitting user data:', {
        username: userPayload.username,
        currentUsername: currentUser?.user_metadata?.username,
        userId: currentUser?.id,
      });

      const { data } = await UserAPI.save(userPayload);

      if (data?.user) {
        mutate('user', data.user);
        router.push('/');
      }
    } catch (error) {
      console.error('Settings update failed:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        constraint: error.constraint,
        status: error.status,
      });

      if (error.code === 'DUPLICATE_USERNAME') {
        setErrors([error.message]);
      } else if (error.code === 'DUPLICATE_DATA') {
        setErrors([error.message]);
      } else {
        setErrors([error.message || '설정 업데이트에 실패했습니다.']);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListErrors errors={errors} />

      <form onSubmit={handleSubmit}>
        <fieldset disabled={isLoading}>
          <fieldset className="form-group">
            <label htmlFor="profile-image">프로필 이미지 URL</label>
            <input
              id="profile-image"
              className="form-control"
              type="url"
              placeholder="URL of profile picture"
              value={userInfo.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
            />
          </fieldset>

          <fieldset className="form-group">
            <label htmlFor="username">사용자명</label>
            <input
              id="username"
              className="form-control form-control-lg"
              type="text"
              placeholder="Username"
              value={userInfo.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              required
            />
          </fieldset>

          <fieldset className="form-group">
            <label htmlFor="bio">자기소개</label>
            <textarea
              id="bio"
              className="form-control form-control-lg"
              placeholder="Short bio about you"
              value={userInfo.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              style={{ overflow: 'auto', resize: 'none' }}
            />
          </fieldset>

          <fieldset className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              className="form-control form-control-lg"
              type="email"
              placeholder="Email"
              value={userInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </fieldset>

          <fieldset className="form-group">
            <label htmlFor="password">새 비밀번호</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                className="form-control form-control-lg"
                type={showPassword ? 'text' : 'password'}
                placeholder="New Password (leave blank to keep current)"
                value={userInfo.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
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
            {isLoading ? 'Updating...' : 'Update Settings'}
          </button>
        </fieldset>
      </form>
    </>
  );
};

export default SettingsForm;
