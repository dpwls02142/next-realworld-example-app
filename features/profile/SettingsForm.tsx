import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import axios from 'axios';
import ListErrors from '../../shared/components/ListErrors';
import checkLogin from '../../lib/utils/checkLogin';
import { SERVER_BASE_URL } from '../../lib/utils/constant';
import storage from '../../lib/utils/storage';

type UserSettingsData = {
  image: string;
  username: string;
  bio: string;
  email: string;
  password: string;
};

const SettingsForm = () => {
  const router = useRouter();
  const { data: currentUser } = useSWR('user', storage);
  const isLoggedIn = checkLogin(currentUser);

  const [isLoading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState<UserSettingsData>({
    image: '',
    username: '',
    bio: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      setUserInfo((prev) => ({ ...prev, ...currentUser, password: '' }));
    }
  }, [isLoggedIn, currentUser]);

  const handleInputChange = (field: keyof UserSettingsData, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
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

      const { data, status } = await axios.put(
        `${SERVER_BASE_URL}/user`,
        { user: userPayload },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${currentUser?.token}`,
          },
        },
      );

      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        mutate('user', data.user);
        router.push('/');
      }
    } catch (error) {
      console.error('Settings update failed:', error);
      setErrors(['설정 업데이트 중 오류가 발생했습니다.']);
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
            <input
              id="password"
              className="form-control form-control-lg"
              type="password"
              placeholder="New Password (leave blank to keep current)"
              value={userInfo.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
            />
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
