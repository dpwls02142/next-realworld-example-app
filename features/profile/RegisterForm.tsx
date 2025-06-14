import { useRouter } from 'next/router';
import { useState } from 'react';
import { mutate } from 'swr';
import ListErrors from '../../shared/components/ListErrors';
import UserAPI from '../../lib/api/user';

type RegisterFormData = {
  username: string;
  email: string;
  password: string;
};

const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const { data, status } = await UserAPI.register(
        formData.username,
        formData.email,
        formData.password,
      );

      if (status !== 200 && data?.errors) {
        setErrors(data.errors);
        return;
      }

      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        mutate('user', data.user);
        router.push('/');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors(['An error occurred while signing up.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListErrors errors={errors} />

      <form onSubmit={handleSubmit}>
        <fieldset disabled={isLoading}>
          <div className="form-group">
            <label htmlFor="register-username">사용자명</label>
            <input
              id="register-username"
              className="form-control form-control-lg"
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">이메일</label>
            <input
              id="register-email"
              className="form-control form-control-lg"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">비밀번호</label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-password"
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
            </div>
          </div>

          <button
            className="btn btn-lg btn-primary pull-xs-right"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Signing up...' : 'Sign up'}
          </button>
        </fieldset>
      </form>
    </>
  );
};

export default RegisterForm;
