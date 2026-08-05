import { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, loginWithGoogle as apiLoginWithGoogle, logoutCurrentBlogSession, getCurrentProfile, LoginCredentials, RegisterCredentials, RegistrationResponse, User } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loginDialogOpen, setLoginDialogOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const restoreSession = async () => {
            const token = localStorage.getItem('accessToken');
            const storedUser = localStorage.getItem('user');
            if (!token) {
                if (!cancelled) setLoading(false);
                return;
            }

            setAccessToken(token);
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch {
                    localStorage.removeItem('user');
                }
            }

            try {
                const profile = await getCurrentProfile();
                if (!cancelled) {
                    setUser(profile.user);
                    localStorage.setItem('user', JSON.stringify(profile.user));
                }
            } catch (error) {
                console.warn('Профилът не можа да бъде синхронизиран:', error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void restoreSession();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const handleSessionEnded = (event: Event) => {
            const detail = (event as CustomEvent<{ message?: string }>).detail;
            setUser(null);
            setAccessToken(null);
            setLoginDialogOpen(true);
            toast({
                title: 'Сесията приключи',
                description: detail?.message || 'Моля, влезте отново.',
                variant: 'destructive',
            });
        };
        window.addEventListener('auth:session-ended', handleSessionEnded);
        return () => window.removeEventListener('auth:session-ended', handleSessionEnded);
    }, [toast]);

    const login = async (credentials: LoginCredentials) => {
        setLoading(true);
        try {
            const data = await apiLogin(credentials);
            if (data && data.access && data.refresh) {
                setAccessToken(data.access);
                const loggedInUser: User = data.user || { id: 0, username: credentials.username || '' };
                setUser(loggedInUser);
                localStorage.setItem('accessToken', data.access);
                localStorage.setItem('refreshToken', data.refresh);
                localStorage.setItem('user', JSON.stringify(loggedInUser));
                setLoginDialogOpen(false); // Close dialog on successful login
            } else {
                throw new Error('Login failed: No tokens returned');
            }
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = async (credential: string) => {
        setLoading(true);
        try {
            const data = await apiLoginWithGoogle(credential);
            if (data && data.access && data.refresh) {
                setAccessToken(data.access);
                setUser(data.user);
                localStorage.setItem('accessToken', data.access);
                localStorage.setItem('refreshToken', data.refresh);
                localStorage.setItem('user', JSON.stringify(data.user));
                setLoginDialogOpen(false);
            } else {
                throw new Error('Google Login failed: No tokens returned');
            }
        } finally {
            setLoading(false);
        }
    };

    const register = async (credentials: RegisterCredentials) => {
        setLoading(true);
        try {
            return await apiRegister(credentials);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await logoutCurrentBlogSession();
        } catch (error) {
            console.warn('Неуспешно server-side прекратяване на сесията:', error);
        } finally {
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    };

    const openLoginDialog = () => setLoginDialogOpen(true);
    const closeLoginDialog = () => setLoginDialogOpen(false);
    const updateUser = useCallback((updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }, []);

    return (
        <AuthContext.Provider value={{ 
            user, 
            isAuthenticated: !!accessToken, 
            login, 
            loginWithGoogle,
            register, // Add register to context value
            logout, 
            loading,
            isLoading: loading,
            loginDialogOpen,
            openLoginDialog,
            closeLoginDialog,
            updateUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
