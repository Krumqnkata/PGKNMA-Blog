import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { login as apiLogin, LoginCredentials, User } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    loading: boolean;
    loginDialogOpen: boolean;
    openLoginDialog: () => void;
    closeLoginDialog: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loginDialogOpen, setLoginDialogOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setAccessToken(token);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials: LoginCredentials) => {
        setLoading(true);
        try {
            const data = await apiLogin(credentials);
            if (data && data.access && data.refresh) {
                setAccessToken(data.access);
                const loggedInUser: User = { id: 0, username: credentials.username || '' };
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

    const logout = () => {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    };

    const openLoginDialog = () => setLoginDialogOpen(true);
    const closeLoginDialog = () => setLoginDialogOpen(false);

    return (
        <AuthContext.Provider value={{ 
            user, 
            isAuthenticated: !!accessToken, 
            login, 
            logout, 
            loading,
            loginDialogOpen,
            openLoginDialog,
            closeLoginDialog
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
