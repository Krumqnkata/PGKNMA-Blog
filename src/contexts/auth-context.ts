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
  loginDialogOpen: boolean;
  openLoginDialog: () => void;
  closeLoginDialog: () => void;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
