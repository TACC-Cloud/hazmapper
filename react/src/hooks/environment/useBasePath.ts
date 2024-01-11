import { useMemo } from 'react';

/**
 * Computes the base path for the application based on the current URL.
 */
const useBasePath = (): string => {
  const basePath = useMemo(() => {
    // note that path order matters
    // as we use startsWith to find a match
    const paths: string[] = [
      '/hazmapper-react',
      '/staging-react',
      '/dev-react',
      '/hazmapper',
      '/staging',
      '/dev',
    ];
    const currentPath: string = window.location.pathname;
    const base: string | undefined = paths.find((path) =>
      currentPath.startsWith(path)
    );
    return base || '/';
  }, []);

  return basePath;
};

export default useBasePath;
