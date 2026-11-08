import { createContext } from "react";

import type {
  LoginCredentials,
  RegisterCredentials,
  RegistrationResponse,
  User,
} from "@/lib/api";

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<RegistrationResponse>;
  logout: () => Promise<void>;
  loading: boolean;
  isLoading: boolean;
  /** The session ended while the visitor was on a page: ask them to sign in without leaving it. */
  sessionExpired: boolean;
  dismissSessionExpired: () => void;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
