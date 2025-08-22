import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from '@/components/Dashboard';
import { useAuthStore } from '@/store/authStore';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return <Dashboard />;
};

export default DashboardPage;