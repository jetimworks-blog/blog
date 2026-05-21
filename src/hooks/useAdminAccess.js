import { useAuth } from './useAuth';

export const useAdminAccess = () => {
  const { user, isLoading } = useAuth();

  return {
    isStaff: user?.is_staff === true,
    isLoading,
    user,
  };
};

export default useAdminAccess;