import { useClipboard } from '@mantine/hooks';

const useAppClipboard = () => {
  return useClipboard({
    timeout: 1500,
  });
};

export default useAppClipboard;
