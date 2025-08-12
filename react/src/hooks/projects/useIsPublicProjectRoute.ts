import { useLocation } from 'react-router-dom';

/**
 * useIsPublicProjectRoute
 *
 * Determines whether the current route is a public project route (i.e. routes
 * that contain `/project-public/` and these public projects don't require
 * authed users)
 *
 * @returns {boolean} True if the current route is public, false otherwise.
 */
export function useIsPublicProjectRoute(): boolean {
  const location = useLocation();
  return location.pathname.includes('/project-public/');
}
