import { apiRequest } from './api_auth';







// src/lib/api.ts (или src/services/posts.ts)

// ❗ Препоръчително: Дефинирайте типа на един пост, ако използвате TypeScript
export interface Post {
    id: number;
    category: number;
    category_name: string; // ✅ Очакваме име на категорията от Django
    author: number;
    author_username: string; // ✅ Очакваме потребителско име на автора от Django
    title: string;
    banner: string | null;
    hook: string; 
    content: string;
    created_at: string;
    published: boolean;
    allowed: boolean;
}
/**
 * Взима списък с всички постове от Django API.
 * @returns Promise<Post[] | null>
 */
export async function getPosts(): Promise<Post[] | null> {
    try {
        const response = await apiRequest('/api/posts/', { method: 'GET' });

        if (!response.ok) {
            console.error(`HTTP грешка при зареждане на постове: ${response.status}`);
            return null; 
        }

        const data: Post[] = await response.json();
        return data;

    } catch (error) {
        console.error('Грешка при комуникация с API за постове:', error);
        return null;
    }
}

/**
 * Fetches a single post by its ID from the API.
 * @param id - The ID of the post to fetch.
 * @returns A promise that resolves to the post object or null if not found or an error occurs.
 */
export async function getPost(id: string): Promise<Post | null> {
    try {
        const response = await apiRequest(`/api/posts/${id}/`, { method: 'GET' });

        if (!response.ok) {
            console.error(`HTTP error fetching post with ID ${id}: ${response.status}`);
            return null;
        }

        const data: Post = await response.json();
        return data;

    } catch (error) {
        console.error(`Error communicating with API for post ID ${id}:`, error);
        return null;
    }
}

export interface LoginCredentials {
    username?: string;
    password?: string;
}

export interface TokenResponse {
    access: string;
    refresh: string;
}

export interface User {
    id: number;
    username: string;
}

export interface Comment {
    id: number;
    author_username: string;
    content: string;
    created_at: string;
}

export async function login(credentials: LoginCredentials): Promise<TokenResponse | null> {
    const API_URL = 'http://localhost:8000/api/auth/token/'; // Standard DRF Simple JWT endpoint

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            // Log the error response body for more context
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            console.error(`Login failed: ${response.status}`, errorData);
            throw new Error(errorData.detail || 'Authentication failed');
        }

        const data: TokenResponse = await response.json();
        return data;

    } catch (error) {
        console.error('Error during login API call:', error);
        throw error; // Re-throw the error to be caught by the calling component
    }
}

export async function getComments(postId: string): Promise<Comment[] | null> {
    try {
        const response = await apiRequest(`/api/posts/${postId}/comments`, { method: 'GET' });

        if (!response.ok) {
            console.error(`HTTP error fetching comments for post ${postId}: ${response.status}`);
            return null;
        }

        const data: Comment[] = await response.json();
        return data;

    } catch (error) {
        console.error(`Error communicating with API for comments on post ${postId}:`, error);
        return null;
    }
}

export async function addComment(postId: string, content: string): Promise<Comment | null> {
    try {
        const response = await apiRequest(`/api/posts/${postId}/comments/add`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Failed to add comment' }));
            console.error(`HTTP error adding comment to post ${postId}: ${response.status}`, errorData);
            throw new Error(errorData.detail || 'Failed to submit comment');
        }

        const data: Comment = await response.json();
        return data;

    } catch (error) {
        console.error(`Error communicating with API to add comment on post ${postId}:`, error);
        throw error;
    }
}
