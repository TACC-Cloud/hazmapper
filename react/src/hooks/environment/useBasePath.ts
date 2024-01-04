/**
 * Computes the base path for the application based on the current URL.
 *
 * This function is more akin to a utility function rather than a traditional React hook,
 * as it does not hook into React state or lifecycle features. TODO_REACT consider moving somewhere else
 */
const useBasePath = (): string => {
  const paths: string[] = ['/react-staging', '/react-dev', '/staging', '/dev'];
  const currentPath: string = window.location.pathname;
  const basePath: string | undefined = paths.find((path) =>
    currentPath.startsWith(path)
  );

  return basePath || '/';
};

export default useBasePath;
