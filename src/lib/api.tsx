import { apiRequest } from './api_auth';

export interface PostDocument {
    id: number;
    file_name: string | null;
    file_url: string;
    uploaded_at: string;
}

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
    documents: PostDocument[];
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
            console.error(`HTTP грешка при извличане на пост с ID ${id}: ${response.status}`);
            return null;
        }

        const data: Post = await response.json();
        return data;

    } catch (error) {
        console.error(`Грешка при комуникация с API за пост ID ${id}:`, error);
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
    post_id: number;
    username: string;
    content: string;
    created_at: string;
    parent?: number | null; // Optional, can be null for top-level comments
    replies?: Comment[];    // Nested replies
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
            const errorData = await response.json().catch(() => ({ detail: 'Неизвестна грешка' }));
            console.error(`Неуспешно влизане: ${response.status}`, errorData);
            throw new Error(errorData.detail || 'Неуспешна идентификация');
        }

        const data: TokenResponse = await response.json();
        return data;

    } catch (error) {
        console.error('Грешка при извикване на API за влизане:', error);
        throw error; // Re-throw the error to be caught by the calling component
    }
}

export async function getComments(postId: string): Promise<Comment[] | null> {
    try {
        const response = await apiRequest(`/api/posts/${postId}/comments`, { method: 'GET' });

        if (!response.ok) {
            console.error(`HTTP грешка при извличане на коментари за пост ${postId}: ${response.status}`);
            return null;
        }

        const data: Comment[] = await response.json();
        return data;

    } catch (error) {
        console.error(`Грешка при комуникация с API за коментари на пост ${postId}:`, error);
        return null;
    }
}

export async function addComment(postId: string, content: string, parentId?: number | null): Promise<Comment | null> {
    try {
        const body: { content: string; parent?: number | null } = { content };
        if (parentId !== undefined && parentId !== null) {
            body.parent = parentId;
        }

        const response = await apiRequest(`/api/posts/${postId}/comments/add/`, {
            method: 'POST',
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Неуспешно добавяне на коментар' }));
            console.error(`HTTP грешка при добавяне на коментар към пост ${postId}: ${response.status}`, errorData);
            throw new Error(errorData.detail || 'Неуспешно изпращане на коментар');
        }

        const data: Comment = await response.json();
        return data;

    } catch (error) {
        console.error(`Грешка при комуникация с API за добавяне на коментар към пост ${postId}:`, error);
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
        const errorData = await response.json().catch(() => ({ detail: 'Неуспешно извличане на статус на анкетата' }));
        console.error(`HTTP грешка при извличане на статус на анкетата: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Не може да се зареди седмичната анкета.');
    }

    return response.json();
}

export async function submitWeeklyPollAnswer(questionId: number, selectedOptionId: number): Promise<UserPollStatus> {
    const response = await apiRequest(`/api/poll/submit/`, {
        method: 'POST',
        body: JSON.stringify({ question: questionId, selected_option: selectedOptionId }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Неуспешно изпращане на отговор' }));
        console.error(`HTTP грешка при изпращане на отговор за анкетата: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Не може да се изпрати вашият отговор.');
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
        const errorData = await response.json().catch(() => ({ detail: 'Неуспешно извличане на статистики за анкетата' }));
        console.error(`HTTP грешка при извличане на статистики за анкетата: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Не може да се заредят статистиките на анкетата.');
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
        const errorData = await response.json().catch(() => ({ detail: 'Неуспешно изпращане на контактна форма' }));
        console.error(`HTTP грешка при изпращане на контактна форма: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Не може да се изпрати вашето съобщение.');
    }

    return response.json();
}


export interface Notification {
  id: number;
  text: string;
  html_text: string;
  enabled: boolean;
  created_at: string;
}

export async function getNotifications(): Promise<Notification[]> {
    const response = await apiRequest(`/api/notifications/`, { method: 'GET' });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Неуспешно извличане на известия' }));
        console.error(`HTTP грешка при извличане на известия: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Не може да се заредят известията.');
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
        const errorData = await response.json().catch(() => ({ detail: 'Неуспешно извличане на събития' }));
        console.error(`HTTP грешка при извличане на събития: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Не може да се заредят събитията.');
    }

    return response.json();
}

export async function getTermsOfService(): Promise<TermsOfServiceContent | null> {
    try {
        const response = await apiRequest('/api/terms-of-service/', { method: 'GET' });

        if (!response.ok) {
            if (response.status === 404) {
                console.warn('Не са намерени Условия за ползване.');
                return null;
            }
            const errorData = await response.json().catch(() => ({ detail: 'Неизвестна грешка' }));
            console.error(`HTTP грешка при извличане на Условия за ползване: ${response.status}`, errorData);
            throw new Error(errorData.detail || 'Не може да се заредят Условията за ползване.');
        }
        

        const data: TermsOfServiceContent = await response.json();
        return data;

    } catch (error) {
        console.error('Грешка при комуникация с API за Условия за ползване:', error);
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
            const errorData = await response.json().catch(() => ({ detail: 'Неизвестна грешка' }));
            console.error(`Регистрацията не бе успешна: ${response.status}`, errorData);
            throw new Error(errorData.detail || 'Регистрацията не бе успешна');
        }

        const data: User = await response.json();
        return data;

    } catch (error) {
        console.error('Грешка при извикване на API за регистрация:', error);
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
                console.warn('Не е намерена Политика за поверителност.');
                return null;
            }
            const errorData = await response.json().catch(() => ({ detail: 'Неизвестна грешка' }));
            console.error(`HTTP грешка при извличане на Политика за поверителност: ${response.status}`, errorData);
            throw new Error(errorData.detail || 'Не може да се зареди Политиката за поверителност.');
        }

        const data: PrivacyPolicyContent = await response.json();
        return data;

    } catch (error) {
        console.error('Грешка при комуникация с API за Политика за поверителност:', error);
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
            const errorData = await response.json().catch(() => ({ detail: 'Неуспешно изпращане на предложение за звънец песен' }));
            console.error(`HTTP грешка при изпращане на предложение за звънец песен: ${response.status}`, errorData);
            throw new Error(errorData.detail || 'Не може да се изпрати вашето предложение.');
        }

        return response.json();
    } catch (error) {
        console.error('Грешка при извикване на API за предложение на звънец песен:', error);
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
        const errorData = await response.json().catch(() => ({ detail: 'Неуспешно извличане на одобрени песни' }));
        console.error(`HTTP грешка при извличане на одобрени песни: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Не може да се заредят песни за гласуване.');
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
        const errorData = await response.json().catch(() => ({ detail: 'Неуспешно извличане на мемове' }));
        console.error(`HTTP грешка при извличане на мемове: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Не може да се заредят мемовете.');
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
        const errorData = await response.json().catch(() => ({ detail: 'Неуспешно изпращане на мемове' }));
        console.error(`HTTP грешка при изпращане на мемове: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Не може да се изпрати вашият мемове.');
    }

    return response.json();
}

export async function voteForMeme(memeId: number): Promise<Meme> {
    const response = await apiRequest(`/api/memes/${memeId}/vote/`, {
        method: 'POST',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Неуспешно гласуване за мемове' }));
        console.error(`HTTP грешка при гласуване за мемове: ${memeId}: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Не може да се изпрати вашето гласуване.');
    }

    return response.json();
}

export async function voteForSong(songId: number): Promise<ApprovedSong> {
    const response = await apiRequest(`/api/songs/${songId}/vote/`, {
        method: 'POST',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Неуспешно гласуване за песен' }));
        console.error(`HTTP грешка при гласуване за песен ${songId}: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Не може да се изпрати вашето гласуване.');
    }

    return response.json();
}

export interface ConsentRecordData {
    consent_status: 'INFORMED' | 'ACCEPTED';
    policy_version: string; // e.g., 'v1.0'
    analytical_accepted?: boolean;
    marketing_accepted?: boolean;
}

export async function recordConsent(data: ConsentRecordData): Promise<{ detail?: string }> {
    const response = await apiRequest(`/api/consent/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Неуспешно записване на съгласие' }));
        console.error(`HTTP грешка при записване на съгласие: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Не може да се запише съгласието.');
    }

    return response.json();
}

export async function getLatestPrivacyPolicyVersion(): Promise<string | null> {
    try {
        const policy = await getPrivacyPolicy();
        return policy ? policy.date : null;
    } catch (error) {
        console.error('Грешка при извличане на последната версия на политиката за поверителност:', error);
        return null;
    }
}

export async function checkUsername(username: string): Promise<{ is_available: boolean }> {
  try {
    const response = await apiRequest(`/api/auth/check-username/?username=${encodeURIComponent(username)}`, { method: 'GET' });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  } catch (error) {
    console.error('Грешка при проверка на потребителско име:', error);
    // In case of error, default to "not available" to be safe
    return { is_available: false }; 
  }
}

export async function validatePassword(password: string): Promise<{ is_valid: boolean; errors?: string[] }> {
  try {
    const response = await apiRequest('/api/auth/validate-password/', {
      method: 'POST',
      body: JSON.stringify({ password: password }),
    });
    // For password validation, a 400 status is expected for failure, not a network error
    if (response.ok) {
        return { is_valid: true };
    }
    const errorData = await response.json();
    return { is_valid: false, errors: errorData.errors || ['Невалидна парола.'] };
  } catch (error) {
    console.error('Грешка при валидация на парола:', error);
    return { is_valid: false, errors: ['Не може да се валидира паролата в момента.'] };
  }
}

export interface SiteStatus {
    maintenance_mode: boolean;
    enable_bell_suggestions: boolean;
    enable_weekly_poll: boolean;
    enable_meme_of_the_week: boolean;
    enable_user_registration: boolean;
    enable_program_page: boolean;
}

export async function getSiteStatus(): Promise<SiteStatus> {
    try {
        const response = await apiRequest(`/api/site-status/`, { method: 'GET' });

        if (!response.ok) {
            console.error(`HTTP грешка при извличане на статуса на сайта: ${response.status}`);
            // Don't return maintenance mode here, let the error be handled by throwing
            const errorData = await response.json().catch(() => ({ detail: 'HTTP error' }));
            throw new Error(errorData.detail || `HTTP error: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Грешка при извличане на статуса на сайта:', error);
        // Re-throw the error so that useQuery can catch it and set isError to true
        throw error;
    }
}

export interface ChangelogEntry {
  content: string;
  updated_at: string;
}

export async function getChangelog(): Promise<ChangelogEntry[]> {
    try {
        const response = await apiRequest(`/api/changelog/`, { method: 'GET' });

        if (!response.ok) {
            if (response.status === 404) return []; // No changelog is not an error
            console.error(`HTTP error fetching changelog: ${response.status}`);
            throw new Error('Could not fetch changelog');
        }

        return response.json();
    } catch (error) {
        console.error('API communication error for changelog:', error);
        // In case of a network error, return empty array to not block the UI
        return [];
    }
}

export interface PasswordChangeData {
    current_password: string;
    new_password: string;
    new_password_confirm: string;
}

export async function updateUserPassword(data: PasswordChangeData): Promise<{ status: string }> {
    const response = await apiRequest(`/api/auth/profile/change-password/`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Неуспешна смяна на парола.' }));
        console.error(`HTTP грешка при смяна на парола: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Възникна грешка при смяната на паролата.');
    }

    return response.json();
}

export async function deleteMyAccount(): Promise<{ status: string }> {
    const response = await apiRequest(`/api/auth/profile/delete/`, {
        method: 'DELETE',
    });

    if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({ detail: 'Неуспешно изтриване на профила.' }));
        console.error(`HTTP грешка при изтриване на профил: ${response.status}`, errorData);
        throw new Error(errorData.detail || 'Възникна грешка при изтриването на профила.');
    }

    // For 204 No Content, there is no body, so we return a success status manually
    return { status: "Профилът е изтрит успешно" };
}

export async function getMySongSuggestions(): Promise<ApprovedSong[]> {
    const response = await apiRequest(`/api/my-content/songs/`, { method: 'GET' });
    if (!response.ok) {
        throw new Error('Неуспешно зареждане на вашите предложения за песни.');
    }
    return response.json();
}

export async function getMyMemes(): Promise<Meme[]> {
    const response = await apiRequest(`/api/my-content/memes/`, { method: 'GET' });
    if (!response.ok) {
        throw new Error('Неуспешно зареждане на вашите мемета.');
    }
    return response.json();
}

export async function getMyComments(): Promise<Comment[]> {
    const response = await apiRequest(`/api/my-content/comments/`, { method: 'GET' });
    if (!response.ok) {
        throw new Error('Неуспешно зареждане на вашите коментари.');
    }
    return response.json();
}

export async function deleteMyComment(commentId: number): Promise<void> {
    const response = await apiRequest(`/api/my-content/comments/${commentId}/delete/`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Неуспешно изтриване на коментара.');
    }
    // No content is returned on successful deletion
}

export async function deleteMySongSuggestion(songId: number): Promise<void> {
    const response = await apiRequest(`/api/my-content/songs/${songId}/delete/`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Неуспешно изтриване на предложението за песен.');
    }
}

export async function deleteMyMeme(memeId: number): Promise<void> {
    const response = await apiRequest(`/api/my-content/memes/${memeId}/delete/`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Неуспешно изтриване на мемето.');
    }
}
