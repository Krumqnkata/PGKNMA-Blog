// src/lib/api_auth.tsx (или src/lib/auth.ts)

// ❗ Уверете се, че типът User е импортиран, ако е нужен другаде
// import { User } from './api'; 

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

let isRefreshing = false;
let failedQueue: any[] = [];

// --- Функции за управление на токени ---

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY); 

/**
 * Запазва Access и Refresh токените в Local Storage.
 * 🎯 Експортиран, за да бъде използван във функцията `login` в `api.ts`.
 */
export const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

// Изтрива всички токени и потребителски данни
const clearAuth = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('user'); // Ако съхранявате потребителски данни
    // Пренасочване към начална страница/логин
    window.location.href = '/'; 
};

// --- Логика за опашка и опресняване ---

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const originalFetch = window.fetch;

/**
 * Обвива оригиналната fetch функция, добавяйки Authorization хедър
 * и обработвайки 401 отговори за автоматично опресняване на токена.
 */
export const authFetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    
    // Първи опит за заявка с текущия Access Token
    let response = await originalFetch(input, {
        ...init,
        headers: {
            ...init?.headers,
            // ❗ Важно: Взема токена при всяка заявка
            'Authorization': `Bearer ${getAccessToken()}`,
            // ❗ Важно: Указва, че изпращаме JSON
            'Content-Type': 'application/json' 
        }
    });

    // --- Обработка на 401 Unauthorized ---
    if (response.status === 401) {
        
        // 1. Ако вече се опреснява, добавя заявката към опашката
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: () => {
                        // Повтаря оригиналната заявка с новия токен
                        const newInit = {
                            ...init,
                            headers: {
                                ...init?.headers,
                                'Authorization': `Bearer ${getAccessToken()}`,
                                'Content-Type': 'application/json'
                            }
                        };
                        resolve(originalFetch(input, newInit));
                    },
                    reject
                });
            });
        } 
        
        // 2. Ако не се опреснява, стартира процеса на опресняване
        isRefreshing = true;

        try {
            const refreshToken = getRefreshToken();
            if (!refreshToken) throw new Error("No refresh token available");

            // Изпращане на заявка за опресняване
            const refreshResponse = await originalFetch('http://localhost:8000/api/token/refresh/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (!refreshResponse.ok) {
                // Ако опресняването е неуспешно (напр. refresh токенът е изтекъл), изчистваме всичко
                clearAuth();
                throw new Error('Failed to refresh token');
            }

            // Успешно опресняване: Запазваме новите токени
            const { access, refresh } = await refreshResponse.json();
            setTokens(access, refresh); 
            processQueue(null, access); // Изпълнява опашката с новия токен

            // Повторно изпълнение на оригиналната заявка с новия Access Token
            response = await originalFetch(input, {
                ...init,
                headers: {
                    ...init?.headers,
                    'Authorization': `Bearer ${access}`,
                    'Content-Type': 'application/json'
                }
            });

        } catch (error) {
            processQueue(error, null); // Изчиства опашката с грешка
            throw error;
        } finally {
            isRefreshing = false;
        }
    }

    // Връщане на отговора (първоначалния или повторения)
    return response;
};

/**
 * Обвивка за API заявки, която добавя базовия URL и използва authFetch.
 * 🎯 Експортиран, за да бъде използван във всички API функции в `api.ts`.
 */
export const apiRequest = async (url: string, options: RequestInit = {}) => {
    // Всички пътища в `api.ts` започват с '/api/...'
    return authFetch(`http://localhost:8000${url}`, options);
};