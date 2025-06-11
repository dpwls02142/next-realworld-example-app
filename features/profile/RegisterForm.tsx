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
            <input
              className="form-control form-control-lg"
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              className="form-control form-control-lg"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              className="form-control form-control-lg"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
            />
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
