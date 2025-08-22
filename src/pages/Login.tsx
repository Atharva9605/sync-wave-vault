import { AuthForm } from '@/components/AuthForm';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return <AuthForm onSuccess={handleSuccess} />;
};

export default Login;