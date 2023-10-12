import React, { useState } from "react";
import isJwtTokenExpired from "jwt-check-expiry";

export const AuthContext = React.createContext<{
  token: string | null;
  setToken:(token: string) => void;
  isLoggedIn: () => boolean;
}>({
  token: null,
  setToken: () => null,
  isLoggedIn: () => false
});

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token') || null);

  const setNewToken = (newToken: string): void => {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
  };

  const isLoggedIn = (): boolean => token !== null && !isJwtTokenExpired(token);

  return <AuthContext.Provider value={{ token, setToken: setNewToken, isLoggedIn }}>{children}</AuthContext.Provider>;
}
