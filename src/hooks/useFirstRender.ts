import { useEffect, useState } from "react";

const useFirstRender = (wait?: number) => {
  const [firstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsFirstRender(false);
    }, wait ?? 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [wait]);

  return firstRender;
};

export default useFirstRender;
