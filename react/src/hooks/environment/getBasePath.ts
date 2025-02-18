/**
 * Computes the base path for the application based on the current URL.
 */
const getBasePath = (): string => {
  // note that path order matters
  // as we use startsWith to find a match
  const paths: string[] = [
    '/hazmapper-react',
    '/staging-react',
    '/dev-react',
    '/exp-react',
    '/hazmapper',
    '/staging',
    '/dev',
    '/exp',
  ];
  const currentPath: string = window.location.pathname;
  const base: string | undefined = paths.find((path) =>
    currentPath.startsWith(path)
  );
  return base || '/';
};

export default getBasePath;
