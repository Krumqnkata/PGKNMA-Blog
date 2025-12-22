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
    images: string[];
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
        const response = await apiRequest(`/api/posts/${postId}/comments/add/`, {
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


export interface PollOption {
    id: number;
    key: "a" | "b" | "c" | "d";
    text: string;
}

export interface PollQuestion {
    id: number;
    title: string;
    subtitle: string;
    code: string;
    options: PollOption[];
}

export interface UserPollStatus {
    is_locked: boolean;
    unlocks_at: string | null;
    question: PollQuestion | null;
    last_result: {
        questionId: number;
        selected: string; // 'a', 'b', etc.
        correct: string;
    } | null;
}

export async function getWeeklyPollStatus(): Promise<UserPollStatus> {
    const response = await apiRequest(`/api/poll/status/`, { method: 'GET' });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch poll status' }));
        console.error(`HTTP error fetching poll status: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Could not load weekly poll.');
    }

    return response.json();
}

export async function submitWeeklyPollAnswer(questionId: number, selectedOptionId: number): Promise<UserPollStatus> {
    const response = await apiRequest(`/api/poll/submit/`, {
        method: 'POST',
        body: JSON.stringify({ question: questionId, selected_option: selectedOptionId }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to submit answer' }));
        console.error(`HTTP error submitting poll answer: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Could not submit your answer.');
    }

    return response.json();
}


export interface LeaderboardEntry {
    id: number;
    username: string;
    correct_answers: number;
}

export interface RecentParticipant {
    id: number;
    username: string;
    last_answered: string;
}

export interface PollStatistics {
    leaderboard: LeaderboardEntry[];
    recent_participants: RecentParticipant[];
}

export async function getPollStatistics(): Promise<PollStatistics> {
    const response = await apiRequest(`/api/poll/statistics/`, { method: 'GET' });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch poll statistics' }));
        console.error(`HTTP error fetching poll statistics: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Could not load poll statistics.');
    }

    return response.json();
}


export interface ContactFormData {
    name: string;
    email: string;
    message: string;
}

export async function submitContactForm(data: ContactFormData): Promise<{ detail: string }> {
    const response = await apiRequest(`/api/contact/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to submit contact form' }));
        console.error(`HTTP error submitting contact form: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Could not submit your message.');
    }

    return response.json();
}


export interface Notification {
  id: number;
  text: string;
  enabled: boolean;
  created_at: string;
}

export async function getNotifications(): Promise<Notification[]> {
    const response = await apiRequest(`/api/notifications/`, { method: 'GET' });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch notifications' }));
        console.error(`HTTP error fetching notifications: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Could not load notifications.');
    }

    return response.json();
}


export interface Event {
    id: number;
    title: string;
    start_datetime: string; // ISO string
    end_datetime: string | null; // ISO string
    location: string;
    category: string;
    description: string;
    attendees_text: string;
    published: boolean;
    created_at: string;
}

export async function getEvents(): Promise<Event[]> {
    const response = await apiRequest(`/api/events/`, { method: 'GET' });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch events' }));
        console.error(`HTTP error fetching events: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Could not load events.');
    }

    return response.json();
}

export async function getTermsOfService(): Promise<TermsOfServiceContent | null> {
    try {
        const response = await apiRequest('/api/terms-of-service/', { method: 'GET' });

        if (!response.ok) {
            if (response.status === 404) {
                console.warn('No Terms of Service found.');
                return null;
            }
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            console.error(`HTTP error fetching Terms of Service: ${response.status}`, errorData);
            throw new Error(errorData.detail || 'Could not load Terms of Service.');
        }

        const data: TermsOfServiceContent = await response.json();
        return data;

    } catch (error) {
        console.error('Error communicating with API for Terms of Service:', error);
        return null;
    }
}

export interface RegisterCredentials {
    username: string;
    password: string;
    password2: string;
    email: string;
    first_name: string; // Added first_name
    last_name: string;  // Added last_name
}

export async function register(credentials: RegisterCredentials): Promise<User> {
    const API_URL = 'http://localhost:8000/api/auth/register/';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            console.error(`Registration failed: ${response.status}`, errorData);
            throw new Error(errorData.detail || 'Registration failed');
        }

        const data: User = await response.json();
        return data;

    } catch (error) {
        console.error('Error during registration API call:', error);
        throw error;
    }
}

export interface PrivacyPolicyContent {
    content: string;
    date: string;
}

export async function getPrivacyPolicy(): Promise<PrivacyPolicyContent | null> {
    try {
        const response = await apiRequest('/api/privacy-policy/', { method: 'GET' });

        if (!response.ok) {
            if (response.status === 404) {
                console.warn('No Privacy Policy found.');
                return null;
            }
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            console.error(`HTTP error fetching Privacy Policy: ${response.status}`, errorData);
            throw new Error(errorData.detail || 'Could not load Privacy Policy.');
        }

        const data: PrivacyPolicyContent = await response.json();
        return data;

    } catch (error) {
        console.error('Error communicating with API for Privacy Policy:', error);
        return null;
    }
}

export interface BellSongSuggestionData {
    link: string;
    slot: string;
    note: string;
    title: string;
}

export async function submitBellSongSuggestion(data: BellSongSuggestionData): Promise<{ detail: string }> {
    try {
        const response = await apiRequest(`/api/bell-song-suggestions/submit/`, {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Failed to submit bell song suggestion' }));
            console.error(`HTTP error submitting bell song suggestion: ${response.status}`, errorData);
            throw new Error(errorData.detail || 'Could not submit your suggestion.');
        }

        return response.json();
    } catch (error) {
        console.error('Error during bell song suggestion API call:', error);
        throw error;
    }
}

export interface ApprovedSong {
    id: number;
    link: string;
    slot: string;
    note: string;
    title: string;
    status: string;
    submitted_at: string;
    user_username: string;
    votes: number;
    has_voted: boolean;
}

export async function getApprovedSongs(): Promise<ApprovedSong[]> {
    const response = await apiRequest(`/api/approved-songs/`, { method: 'GET' });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch approved songs' }));
        console.error(`HTTP error fetching approved songs: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Could not load songs for voting.');
    }

    return response.json();
}

export interface Meme {
    id: number;
    title: string;
    image_url: string;
    user_username: string;
    created_at: string;
    is_approved: boolean;
    votes: number;
    has_voted: boolean;
}

export interface MemeSubmission {
    title: string;
    image: File;
}

export async function getMemes(): Promise<Meme[]> {
    const response = await apiRequest(`/api/memes/`, { method: 'GET' });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch memes' }));
        console.error(`HTTP error fetching memes: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Could not load memes.');
    }

    return response.json();
}

export async function submitMeme(data: MemeSubmission): Promise<Meme> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('image', data.image);

    const response = await apiRequest(`/api/memes/`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to submit meme' }));
        console.error(`HTTP error submitting meme: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Could not submit your meme.');
    }

    return response.json();
}

export async function voteForMeme(memeId: number): Promise<Meme> {
    const response = await apiRequest(`/api/memes/${memeId}/vote/`, {
        method: 'POST',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to vote for meme' }));
        console.error(`HTTP error voting for meme ${memeId}: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Could not submit your vote.');
    }

    return response.json();
}

export async function voteForSong(songId: number): Promise<ApprovedSong> {
    const response = await apiRequest(`/api/songs/${songId}/vote/`, {
        method: 'POST',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to vote for song' }));
        console.error(`HTTP error voting for song ${songId}: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Could not submit your vote.');
    }

    return response.json();
}


