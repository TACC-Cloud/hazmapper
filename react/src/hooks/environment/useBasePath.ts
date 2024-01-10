import { useMemo } from 'react';

/**
 * Computes the base path for the application based on the current URL.
 */
const useBasePath = (): string => {
  const basePath = useMemo(() => {
    const paths: string[] = [
      '/hazmapper-react',
      '/staging-react',
      '/dev-react',
      '/staging',
      '/dev',
    ];
    const currentPath: string = window.location.pathname;
    const base: string | undefined = paths.find((path) =>
      currentPath.startsWith(path)
    );
    console.log(currentPath);
    console.log(base);
    return base || '/';
  }, []);

  return basePath;
};

export default useBasePath;
