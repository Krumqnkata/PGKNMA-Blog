import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { loginPath } from "@/lib/auth-paths";

/** Opens the login page and comes back to the current page after signing in. */
export function useGoToLogin() {
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();

  return useCallback(() => {
    navigate(loginPath(`${pathname}${search}${hash}`));
  }, [hash, navigate, pathname, search]);
}
