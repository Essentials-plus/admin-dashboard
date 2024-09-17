import { ACCESS_TOKEN_KEY } from '@/constants/local-storage';
import { useLocalStorage } from '@mantine/hooks';

export let removeAccessTokenFromLocalStorage: null | (() => void) = null;

const useSession = () => {
  const [accessToken, setAccessToken, removeAccessToken] = useLocalStorage<
    string | undefined
  >({
    key: ACCESS_TOKEN_KEY,
    defaultValue: undefined,
  });

  removeAccessTokenFromLocalStorage = removeAccessToken;

  const login = (token: string) => {
    setAccessToken(token);
  };
  const logout = () => {
    removeAccessToken();
  };

  return {
    login,
    logout,
    accessToken,
  };
};

export default useSession;
