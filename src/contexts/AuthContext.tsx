import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, loginWithGoogle as apiLoginWithGoogle, logoutCurrentBlogSession, getCurrentProfile, LoginCredentials, RegisterCredentials, RegistrationResponse, User } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '@/contexts/auth-context';
import type { AuthContextValue } from '@/contexts/auth-context';
import { detachCurrentPushSubscription, syncCurrentPushSubscription } from '@/lib/push-notifications';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [sessionExpired, setSessionExpired] = useState(false);

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
        if (loading) return;
        const synchronize = accessToken
            ? syncCurrentPushSubscription
            : detachCurrentPushSubscription;
        void synchronize().catch((error) => {
            console.warn('Push устройството не можа да бъде синхронизирано с профила:', error);
        });
    }, [accessToken, loading]);

    useEffect(() => {
        const handleSessionEnded = (event: Event) => {
            const detail = (event as CustomEvent<{ message?: string }>).detail;
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            void detachCurrentPushSubscription().catch((error) => {
                console.warn('Push устройството не можа да бъде откачено от изтеклата сесия:', error);
            });
            queryClient.removeQueries({ queryKey: ['notifications'] });
            setSessionExpired(true);
            toast({
                title: 'Сесията приключи',
                description: detail?.message || 'Моля, влезте отново.',
                variant: 'destructive',
            });
        };
        window.addEventListener('auth:session-ended', handleSessionEnded);
        return () => window.removeEventListener('auth:session-ended', handleSessionEnded);
    }, [queryClient, toast]);

    const login = useCallback(async (credentials: LoginCredentials) => {
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
                setSessionExpired(false);
            } else {
                throw new Error('Login failed: No tokens returned');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const loginWithGoogle = useCallback(async (credential: string) => {
        setLoading(true);
        try {
            const data = await apiLoginWithGoogle(credential);
            if (data && data.access && data.refresh) {
                setAccessToken(data.access);
                setUser(data.user);
                localStorage.setItem('accessToken', data.access);
                localStorage.setItem('refreshToken', data.refresh);
                localStorage.setItem('user', JSON.stringify(data.user));
                setSessionExpired(false);
            } else {
                throw new Error('Google Login failed: No tokens returned');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (credentials: RegisterCredentials) => {
        setLoading(true);
        try {
            return await apiRegister(credentials);
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await detachCurrentPushSubscription();
        } catch (error) {
            console.warn('Push устройството не можа да бъде откачено от профила:', error);
        }
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
            queryClient.removeQueries({ queryKey: ['notifications'] });
        }
    }, [queryClient]);

    const dismissSessionExpired = useCallback(() => setSessionExpired(false), []);
    const updateUser = useCallback((updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }, []);

    const value = useMemo<AuthContextValue>(() => ({
            user, 
            isAuthenticated: !!accessToken, 
            login, 
            loginWithGoogle,
            register, // Add register to context value
            logout, 
            loading,
            isLoading: loading,
            sessionExpired,
            dismissSessionExpired,
            updateUser,
    }), [accessToken, dismissSessionExpired, loading, login, loginWithGoogle, logout, register, sessionExpired, updateUser, user]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
