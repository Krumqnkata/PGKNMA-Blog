import { apiRequest, API_BASE_URL, resolveApiUrl } from './api_auth';

export interface PostDocument {
    id: number;
    file_name: string | null;
    file_url: string;
    uploaded_at: string;
}

export interface PostGalleryImage {
    id: number;
    image_url: string;
    title: string;
    alt_text: string;
    position: number;
    is_featured: boolean;
    focus_x: number;
    focus_y: number;
}

// ❗ Препоръчително: Дефинирайте типа на един пост, ако използвате TypeScript
export interface Post {
    id: number;
    category: number;
    category_name: string; // ✅ Очакваме име на категорията от Django
    author: number;
    author_username: string; // ✅ Очакваме потребителско име на автора от Django
    author_avatar_url: string | null;
    title: string;
    banner: string | null;
    hook: string; 
    content: string;
    created_at: string;
    published_at: string | null;
    published: boolean;
    allowed: boolean;
    images: string[];
    gallery: PostGalleryImage[];
    documents: PostDocument[];
}
// Helper to safely extract array from DRF paginated response or plain array
export function normalizeArray<T>(data: unknown): T[] {
    if (Array.isArray(data)) {
        return data;
    }
    if (data && typeof data === 'object') {
        const record = data as Record<string, unknown>;
        if (Array.isArray(record.results)) return record.results as T[];
        if (Array.isArray(record.data)) return record.data as T[];
        if (Array.isArray(record.items)) return record.items as T[];
    }
    return [];
}

type ApiErrorPayload = Record<string, unknown>;

export class ApiResponseError extends Error {
    code?: string;
    status: number;

    constructor(message: string, status: number, code?: string) {
        super(message);
        this.name = 'ApiResponseError';
        this.status = status;
        this.code = code;
    }
}

const errorValueToText = (value: unknown): string[] => {
    if (typeof value === "string") return [value];
    if (Array.isArray(value)) return value.flatMap(errorValueToText);
    if (value && typeof value === "object") {
        return Object.values(value as ApiErrorPayload).flatMap(errorValueToText);
    }
    return [];
};

/** Converts Django/DRF error payloads into clear messages for the interface. */
export async function getApiErrorMessage(response: Response, fallback: string): Promise<string> {
    const payload = await response.json().catch(() => null) as unknown;
    if (typeof payload === "string" && payload.trim()) return payload;
    if (!payload || typeof payload !== "object") return fallback;

    const data = payload as ApiErrorPayload;
    for (const key of ["detail", "message", "error"]) {
        if (typeof data[key] === "string" && data[key].trim()) {
            return data[key] as string;
        }
    }

    const messages = Object.entries(data).flatMap(([field, value]) =>
        errorValueToText(value).map((message) =>
            field === "non_field_errors" ? message : `${field.replace(/_/g, " ")}: ${message}`
        )
    );
    return messages.length ? messages.join(" ") : fallback;
}

async function createApiResponseError(response: Response, fallback: string) {
    const payload = await response.clone().json().catch(() => null) as ApiErrorPayload | null;
    const message = await getApiErrorMessage(response, fallback);
    const rawCode = payload?.code;
    const code = typeof rawCode === 'string'
        ? rawCode
        : Array.isArray(rawCode) && typeof rawCode[0] === 'string'
            ? rawCode[0]
            : undefined;
    return new ApiResponseError(message, response.status, code);
}

const withResolvedPostMedia = (post: Post): Post => {
    const resolvedImages = (post.images || []).map((image) => resolveApiUrl(image));
    const gallery = (
        post.gallery?.length
            ? post.gallery.map((image) => ({
                ...image,
                image_url: resolveApiUrl(image.image_url),
            }))
            : resolvedImages.map((imageUrl, index) => ({
                id: index,
                image_url: imageUrl,
                title: "",
                alt_text: "",
                position: index,
                is_featured: false,
                focus_x: 50,
                focus_y: 50,
            }))
    ).sort((first, second) => (
        Number(second.is_featured) - Number(first.is_featured)
        || first.position - second.position
        || first.id - second.id
    ));

    return {
        ...post,
        banner: resolveApiUrl(post.banner) || null,
        author_avatar_url: resolveApiUrl(post.author_avatar_url) || null,
        images: resolvedImages,
        gallery,
        documents: post.documents.map((document) => ({
            ...document,
            file_url: resolveApiUrl(document.file_url),
        })),
    };
};

const withResolvedPollMedia = (status: UserPollStatus): UserPollStatus => ({
    ...status,
    question: status.question ? {
        ...status.question,
        image_url: resolveApiUrl(status.question.image_url) || null,
        options: status.question.options.map((option) => ({ ...option, image_url: resolveApiUrl(option.image_url) || null })),
    } : null,
});

const withResolvedMemeImage = (meme: Meme): Meme => ({ ...meme, image_url: resolveApiUrl(meme.image_url) });

/**
 * Взима списък с всички постове от Django API.
 * @returns Promise<Post[]>
 */
export async function getPosts(): Promise<Post[]> {
    try {
        const response = await apiRequest('/api/posts/', { method: 'GET' });

        if (!response.ok) {
            throw new Error(await getApiErrorMessage(response, 'Не може да се заредят новините.'));
        }

        const data = await response.json();
        return normalizeArray<Post>(data).map(withResolvedPostMedia);

    } catch (error) {
        console.error('Грешка при комуникация с API за постове:', error);
        throw error;
    }
}

/**
 * Fetches a single post by its ID from the API.
 * @param id - The ID of the post to fetch.
 * @returns A promise that resolves to the post object, or null when it does not exist.
 */
export async function getPost(id: string): Promise<Post | null> {
    try {
        const response = await apiRequest(`/api/posts/${id}/`, { method: 'GET' });

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(await getApiErrorMessage(response, 'Не може да се зареди публикацията.'));
        }

        const data: Post = await response.json();
        return withResolvedPostMedia(data);

    } catch (error) {
        console.error(`Грешка при комуникация с API за пост ID ${id}:`, error);
        throw error;
    }
}

export interface LoginCredentials {
    username: string;
    password: string;
    captcha_answer: string;
}

export interface TokenResponse {
    access: string;
    refresh: string;
    user?: User;
}

export interface User {
    id: number;
    username: string;
    email?: string;
    has_password?: boolean;
    avatar_url?: string | null;
    avatar_source?: AvatarSource;
    avatar_preset?: string;
    email_verified?: boolean;
}

export type AvatarSource = 'initials' | 'upload' | 'preset' | 'google';

export interface AvatarPreset {
    id: string;
    label: string;
    url: string;
}

export interface AvatarOptions {
    max_upload_bytes: number;
    output_size: number;
    allowed_mime_types: string[];
    presets: AvatarPreset[];
}

export interface CurrentProfileResponse {
    user: User;
    avatar_options: AvatarOptions;
    public_profile: PublicProfileSettings;
}

export interface AvatarUpdateResponse {
    user: User;
}

export interface PublicProfileSettings {
    bio: string;
    public_profile_enabled: boolean;
    show_email_on_profile: boolean;
    show_comments_on_profile: boolean;
}

export interface Comment {
    id: number;
    post_id: number;
    username: string;
    avatar_url: string | null;
    content: string;
    created_at: string;
    parent?: number | null; // Optional, can be null for top-level comments
    parent_id: number | null;
    parent_username: string | null;
    reply_count: number;
    replies?: Comment[];    // Nested replies
}

const withResolvedUserAvatar = (user: User): User => ({
    ...user,
    avatar_url: resolveApiUrl(user.avatar_url) || null,
});

const withResolvedCommentAvatar = (comment: Comment): Comment => ({
    ...comment,
    avatar_url: resolveApiUrl(comment.avatar_url) || null,
});

export async function login(credentials: LoginCredentials): Promise<TokenResponse | null> {
    const API_URL = `${API_BASE_URL}/api/auth/token/`; // Standard DRF Simple JWT endpoint

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            throw await createApiResponseError(response, 'Неуспешна идентификация.');
        }

        const data: TokenResponse = await response.json();
        if (data.user) data.user = withResolvedUserAvatar(data.user);
        return data;

    } catch (error) {
        console.error('Грешка при извикване на API за влизане:', error);
        throw error; // Re-throw the error to be caught by the calling component
    }
}

export interface GoogleLoginResponse {
    access: string;
    refresh: string;
    user: User;
}

export async function loginWithGoogle(credential: string): Promise<GoogleLoginResponse | null> {
    const API_URL = `${API_BASE_URL}/api/auth/google/`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ credential }),
        });

        if (!response.ok) {
            throw new Error(await getApiErrorMessage(
                response,
                'Неуспешна идентификация с Google.'
            ));
        }

        const data: GoogleLoginResponse = await response.json();
        data.user = withResolvedUserAvatar(data.user);
        return data;
    } catch (error) {
        console.error('Грешка при извикване на API за влизане с Google:', error);
        throw error;
    }
}


export async function getComments(postId: string): Promise<Comment[]> {
    try {
        const response = await apiRequest(`/api/posts/${postId}/comments/`, { method: 'GET' });

        if (!response.ok) {
            throw new Error(await getApiErrorMessage(response, 'Не може да се заредят коментарите.'));
        }

        const data = await response.json();
        return normalizeArray<Comment>(data).map(withResolvedCommentAvatar);

    } catch (error) {
        console.error(`Грешка при комуникация с API за коментари на пост ${postId}:`, error);
        throw error;
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
            throw new Error(await getApiErrorMessage(
                response,
                'Неуспешно изпращане на коментар.'
            ));
        }

        const data: Comment = await response.json();
        return withResolvedCommentAvatar(data);

    } catch (error) {
        console.error(`Грешка при комуникация с API за добавяне на коментар към пост ${postId}:`, error);
        throw error;
    }
}


export interface PollOption {
    id: number;
    key: "a" | "b" | "c" | "d";
    text: string;
    image_url: string | null;
}

export interface PollQuestion {
    id: number;
    title: string;
    subtitle: string;
    task_description: string;
    image_url: string | null;
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
        throw new Error(await getApiErrorMessage(response, 'Не може да се зареди седмичната анкета.'));
    }

    return withResolvedPollMedia(await response.json());
}

export async function submitWeeklyPollAnswer(questionId: number, selectedOptionId: number): Promise<UserPollStatus> {
    const response = await apiRequest(`/api/poll/submit/`, {
        method: 'POST',
        body: JSON.stringify({ question: questionId, selected_option: selectedOptionId }),
    });

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Не може да се изпрати вашият отговор.'));
    }

    return withResolvedPollMedia(await response.json());
}


export interface PollStatistics {
    total_participants: number;
    total_answers: number;
    correct_answers: number;
    leaderboard: Array<{
        id: number;
        username: string;
        correct_answers: number;
    }>;
}

export async function linkGoogleAccount(credential: string, currentPassword: string): Promise<{ detail: string }> {
    const response = await apiRequest('/api/auth/google/link/', {
        method: 'POST',
        body: JSON.stringify({ credential, current_password: currentPassword }),
    });

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Неуспешно свързване с Google.'));
    }

    return response.json();
}

export async function getPollStatistics(): Promise<PollStatistics> {
    const response = await apiRequest(`/api/poll/statistics/`, { method: 'GET' });

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            'Не може да се заредят статистиките на анкетата.'
        ));
    }

    return response.json();
}


export interface ContactFormData {
    name: string;
    email: string;
    message: string;
    reason: string;
}

export async function submitContactForm(data: ContactFormData): Promise<{ detail: string }> {
    const response = await apiRequest(`/api/contact/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Не може да се изпрати вашето съобщение.'));
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
        throw new Error(await getApiErrorMessage(response, 'Не може да се заредят известията.'));
    }

    const data = await response.json();
    return normalizeArray<Notification>(data);
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
        throw new Error(await getApiErrorMessage(response, 'Не може да се заредят събитията.'));
    }

    const data = await response.json();
    return normalizeArray<Event>(data);
}

export interface TermsOfServiceContent {
    content: string;
    date: string;
}

export async function getTermsOfService(): Promise<TermsOfServiceContent | null> {
    try {
        const response = await apiRequest('/api/terms-of-service/', { method: 'GET' });

        if (!response.ok) {
            if (response.status === 404) {
                console.warn('Не са намерени Условия за ползване.');
                return null;
            }
            throw new Error(await getApiErrorMessage(
                response,
                'Не може да се заредят Условията за ползване.'
            ));
        }
        

        const data: TermsOfServiceContent = await response.json();
        return data;

    } catch (error) {
        console.error('Грешка при комуникация с API за Условия за ползване:', error);
        throw error;
    }
}

export interface RegisterCredentials {
    username: string;
    password: string;
    password2: string;
    email: string;
    first_name: string; // Added first_name
    last_name: string;  // Added last_name
    captcha_answer: string;
}

export interface RegistrationResponse {
    username: string;
    email: string;
    verification_required: boolean;
    email_sent: boolean;
    auto_verified: boolean;
    email_failure_reason?: "daily_quota_exceeded" | "monthly_quota_exceeded" | "rate_limit_exceeded" | "service_unavailable" | "delivery_failed" | null;
    detail: string;
}

export async function register(credentials: RegisterCredentials): Promise<RegistrationResponse> {
    const API_URL = `${API_BASE_URL}/api/auth/register/`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            throw new Error(await getApiErrorMessage(response, 'Регистрацията не бе успешна.'));
        }

        const data: RegistrationResponse = await response.json();
        return data;

    } catch (error) {
        console.error('Грешка при извикване на API за регистрация:', error);
        throw error;
    }
}

export async function resendVerificationEmail(email: string): Promise<{ detail: string }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-email/resend/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            'Имейлът за потвърждение не можа да бъде изпратен.',
        ));
    }
    return response.json();
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
            throw new Error(await getApiErrorMessage(
                response,
                'Не може да се зареди Политиката за поверителност.'
            ));
        }

        const data: PrivacyPolicyContent = await response.json();
        return data;

    } catch (error) {
        console.error('Грешка при комуникация с API за Политика за поверителност:', error);
        throw error;
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
            throw new Error(await getApiErrorMessage(
                response,
                'Не може да се изпрати вашето предложение.'
            ));
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
        throw new Error(await getApiErrorMessage(
            response,
            'Не може да се заредят песни за гласуване.'
        ));
    }

    const data = await response.json();
    return normalizeArray<ApprovedSong>(data);
}

export interface Meme {
    id: number;
    title: string;
    image_url: string;
    user_username: string;
    created_at: string;
    status: "pending" | "approved" | "rejected";
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
        throw new Error(await getApiErrorMessage(response, 'Не може да се заредят мемовете.'));
    }

    const data = await response.json();
    return normalizeArray<Meme>(data).map(withResolvedMemeImage);
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
        throw new Error(await getApiErrorMessage(response, 'Не може да се изпрати мемето.'));
    }

    return withResolvedMemeImage(await response.json());
}

export async function voteForMeme(memeId: number): Promise<Meme> {
    const response = await apiRequest(`/api/memes/${memeId}/vote/`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Не може да се изпрати вашето гласуване.'));
    }

    return withResolvedMemeImage(await response.json());
}

export async function voteForSong(songId: number): Promise<ApprovedSong> {
    const response = await apiRequest(`/api/songs/${songId}/vote/`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Не може да се изпрати вашето гласуване.'));
    }

    return response.json();
}

export interface ConsentRecordData {
    consent_status: 'INFORMED' | 'ACCEPTED' | 'REJECTED';
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
        throw new Error(await getApiErrorMessage(response, 'Не може да се запише съгласието.'));
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
      throw new Error(await getApiErrorMessage(response, 'Не може да се провери потребителското име.'));
    }
    return response.json();
  } catch (error) {
    console.error('Грешка при проверка на потребителско име:', error);
    throw error;
  }
}

export async function validatePassword(password: string): Promise<{ is_valid: boolean; errors?: string[] }> {
  try {
    const response = await apiRequest('/api/auth/validate-password/', {
      method: 'POST',
      body: JSON.stringify({ password: password }),
    });
    if (response.ok) {
        return { is_valid: true };
    }
    // A 400 means that the password does not meet the rules; show those rules inline.
    if (response.status === 400) {
        const errorData = await response.json().catch(() => null) as ApiErrorPayload | null;
        const errors = errorData ? errorValueToText(errorData.errors ?? errorData) : [];
        return { is_valid: false, errors: errors.length ? errors : ['Невалидна парола.'] };
    }
    throw new Error(await getApiErrorMessage(response, 'Не може да се валидира паролата в момента.'));
  } catch (error) {
    console.error('Грешка при валидация на парола:', error);
    throw error;
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

export interface ProgramScheduleResponse {
    classes: string[];
    headers: string[];
    rows: Array<Record<string, string>>;
}

export async function getProgramSchedule(): Promise<ProgramScheduleResponse> {
    const response = await apiRequest('/api/program/', { method: 'GET' });
    if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Не може да се зареди учебната програма.'));
    }
    return response.json();
}

export async function getSiteStatus(): Promise<SiteStatus> {
    try {
        const response = await apiRequest(`/api/site-status/`, { method: 'GET' });

        if (!response.ok) {
            console.error(`HTTP грешка при извличане на статуса на сайта: ${response.status}`);
            // Don't return maintenance mode here, let the error be handled by throwing
            throw new Error(await getApiErrorMessage(
                response,
                `Грешка при зареждане на статуса на сайта (${response.status}).`
            ));
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
            throw new Error(await getApiErrorMessage(
                response,
                'Не може да се зареди дневникът на промените.'
            ));
        }

        const data = await response.json();
        return normalizeArray<ChangelogEntry>(data);
    } catch (error) {
        console.error('API communication error for changelog:', error);
        throw error;
    }
}

export interface PasswordChangeData {
    current_password: string;
    new_password: string;
    new_password_confirm: string;
}

export interface UsernameChangeData {
    current_password: string;
    new_username: string;
}

export async function changeUsername(data: UsernameChangeData): Promise<{ status: string }> {
    const response = await apiRequest(`/api/auth/profile/change-username/`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            'Възникна грешка при смяната на потребителското име.'
        ));
    }

    return response.json();
}

export async function updateUserPassword(data: PasswordChangeData): Promise<{ status: string }> {
    const response = await apiRequest(`/api/auth/profile/change-password/`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            'Възникна грешка при смяната на паролата.'
        ));
    }

    return response.json();
}

export async function deactivateMyAccount(): Promise<{ status: string }> {
    const response = await apiRequest(`/api/auth/profile/deactivate/`, {
        method: 'PUT',
    });

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            'Възникна грешка при деактивирането на профила.'
        ));
    }

    return response.json();
}

const resolveCurrentProfile = (data: CurrentProfileResponse): CurrentProfileResponse => ({
    user: withResolvedUserAvatar(data.user),
    avatar_options: {
        ...data.avatar_options,
        presets: data.avatar_options.presets.map((preset) => ({
            ...preset,
            url: resolveApiUrl(preset.url),
        })),
    },
    public_profile: data.public_profile || {
        bio: '',
        public_profile_enabled: true,
        show_email_on_profile: false,
        show_comments_on_profile: true,
    },
});

const resolveAvatarUpdate = (data: AvatarUpdateResponse): AvatarUpdateResponse => ({
    user: withResolvedUserAvatar(data.user),
});

export async function getCurrentProfile(): Promise<CurrentProfileResponse> {
    const response = await apiRequest('/api/profile/', { method: 'GET' });
    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            'Профилът не може да бъде зареден.'
        ));
    }
    return resolveCurrentProfile(await response.json());
}

export async function updatePublicProfileSettings(
    settings: PublicProfileSettings,
): Promise<PublicProfileSettings> {
    const response = await apiRequest('/api/profile/public-settings/', {
        method: 'PATCH',
        body: JSON.stringify(settings),
    });
    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            'Настройките за публичния профил не могат да бъдат запазени.',
        ));
    }
    return response.json();
}

export async function uploadProfileAvatar(file: File): Promise<AvatarUpdateResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiRequest('/api/profile/avatar/', {
        method: 'PUT',
        body: formData,
    });
    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            'Профилната снимка не може да бъде качена.'
        ));
    }
    return resolveAvatarUpdate(await response.json());
}

export async function selectProfileAvatarPreset(presetId: string): Promise<AvatarUpdateResponse> {
    const response = await apiRequest('/api/profile/avatar/', {
        method: 'PUT',
        body: JSON.stringify({ preset_id: presetId }),
    });
    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            'Готовият аватар не може да бъде избран.'
        ));
    }
    return resolveAvatarUpdate(await response.json());
}

export async function resetProfileAvatar(): Promise<AvatarUpdateResponse> {
    const response = await apiRequest('/api/profile/avatar/', {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            'Профилната снимка не може да бъде премахната.'
        ));
    }
    return resolveAvatarUpdate(await response.json());
}

export type BlogSessionStatus = 'active' | 'expired' | 'revoked';

export interface BlogLoginSession {
    id: string;
    auth_method: 'password' | 'google';
    auth_method_display: string;
    ip_address: string | null;
    network_operator: string;
    network_asn: number | null;
    device_label: string;
    created_at: string;
    last_seen_at: string;
    expires_at: string;
    revoked_at: string | null;
    revoked_reason: string;
    revoked_reason_display: string;
    status: BlogSessionStatus;
    is_current: boolean;
}

export async function getBlogLoginSessions(): Promise<BlogLoginSession[]> {
    const response = await apiRequest('/api/profile/sessions/', {
        method: 'GET',
    });
    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            'Историята на входовете не може да бъде заредена.'
        ));
    }
    return normalizeArray<BlogLoginSession>(await response.json());
}

export async function revokeBlogLoginSession(sessionId: string): Promise<{ detail: string }> {
    const response = await apiRequest(
        `/api/profile/sessions/${sessionId}/revoke/`,
        { method: 'POST' },
    );
    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            'Сесията не може да бъде прекратена.'
        ));
    }
    return response.json();
}

export async function revokeOtherBlogLoginSessions(): Promise<{ detail: string; revoked_count: number }> {
    const response = await apiRequest(
        '/api/profile/sessions/revoke-others/',
        { method: 'POST' },
    );
    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            'Другите сесии не могат да бъдат прекратени.'
        ));
    }
    return response.json();
}

export async function downloadMyPersonalData(): Promise<{ filename: string }> {
    const response = await apiRequest('/api/profile/export/', {
        method: 'GET',
        headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            'Личните данни не могат да бъдат експортирани.'
        ));
    }

    const disposition = response.headers.get('Content-Disposition') || '';
    const encodedMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
    let filename = `pgknma-personal-data-${new Date().toISOString().slice(0, 10)}.json`;
    if (encodedMatch?.[1]) {
        try {
            filename = decodeURIComponent(encodedMatch[1]);
        } catch {
            filename = encodedMatch[1];
        }
    } else if (plainMatch?.[1]) {
        filename = plainMatch[1];
    }

    const objectUrl = URL.createObjectURL(await response.blob());
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    return { filename };
}

export async function logoutCurrentBlogSession(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return;

    const logoutRequest = (refresh: string) => apiRequest('/api/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
    });

    let response = await logoutRequest(refreshToken);
    const rotatedRefreshToken = localStorage.getItem('refreshToken');
    if (
        response.status === 400
        && rotatedRefreshToken
        && rotatedRefreshToken !== refreshToken
    ) {
        response = await logoutRequest(rotatedRefreshToken);
    }
    if (!response.ok && response.status !== 401) {
        throw new Error(await getApiErrorMessage(
            response,
            'Сесията не можа да бъде прекратена на сървъра.'
        ));
    }
}

export async function getMySongSuggestions(): Promise<ApprovedSong[]> {
    const response = await apiRequest(`/api/my-content/songs/`, { method: 'GET' });
    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            'Неуспешно зареждане на вашите предложения за песни.'
        ));
    }
    const data = await response.json();
    return normalizeArray<ApprovedSong>(data);
}

export async function getMyMemes(): Promise<Meme[]> {
    const response = await apiRequest(`/api/my-content/memes/`, { method: 'GET' });
    if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Неуспешно зареждане на вашите мемета.'));
    }
    const data = await response.json();
    return normalizeArray<Meme>(data).map(withResolvedMemeImage);
}

export async function getMyComments(): Promise<Comment[]> {
    const response = await apiRequest(`/api/my-content/comments/`, { method: 'GET' });
    if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Неуспешно зареждане на вашите коментари.'));
    }
    const data = await response.json();
    return normalizeArray<Comment>(data);
}

export async function deleteMyComment(commentId: number): Promise<void> {
    const response = await apiRequest(`/api/my-content/comments/${commentId}/delete/`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Неуспешно изтриване на коментара.'));
    }
    // No content is returned on successful deletion
}

export async function deleteMySongSuggestion(songId: number): Promise<void> {
    const response = await apiRequest(`/api/my-content/songs/${songId}/delete/`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            'Неуспешно изтриване на предложението за песен.'
        ));
    }
}

export async function deleteMyMeme(memeId: number): Promise<void> {
    const response = await apiRequest(`/api/my-content/memes/${memeId}/delete/`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Неуспешно изтриване на мемето.'));
    }
}

export interface GamificationLevel {
    number: number;
    title: string;
    icon: string;
    minimum_points: number;
}

export type GamificationBadgeRarity = 'common' | 'rare' | 'epic' | 'seasonal';

export interface GamificationBadge {
    slug: string;
    title: string;
    description: string;
    icon: string;
    rarity: GamificationBadgeRarity;
    hidden: boolean;
    points_reward: number;
    earned: boolean;
    awarded_at: string | null;
}

export interface PointTransaction {
    id: number;
    action: string;
    points: number;
    balance_after: number;
    description: string;
    source: 'activity' | 'badge' | 'admin' | 'reversal';
    created_at: string;
}

export interface MissionRequirementProgress {
    key: string;
    label: string;
    current: number;
    target: number;
    complete: boolean;
}

export interface GamificationMission {
    slug: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    reward_points: number;
    requirements: MissionRequirementProgress[];
    progress_percent: number;
    completed_at: string | null;
    rewarded_at: string | null;
}

export interface GamificationProfile {
    points: number;
    level: GamificationLevel | null;
    next_level: GamificationLevel | null;
    progress_percent: number;
    points_to_next: number;
    leaderboard_opt_in: boolean;
    badges: GamificationBadge[];
    recent_transactions: PointTransaction[];
    missions: GamificationMission[];
}

export async function getGamificationProfile(): Promise<GamificationProfile> {
    const response = await apiRequest('/api/gamification/profile/', {
        method: 'GET',
    });
    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            'Прогресът ви не може да бъде зареден.',
        ));
    }
    return response.json();
}

export interface LeaderboardEntry {
    rank: number;
    username: string;
    avatar_url: string | null;
    points: number;
}

export interface LeaderboardSection {
    top: LeaderboardEntry[];
    current_user: LeaderboardEntry | null;
}

export interface GamificationLeaderboard {
    weekly: LeaderboardSection;
    monthly: LeaderboardSection;
    all_time: LeaderboardSection;
}

export async function getGamificationLeaderboard(): Promise<GamificationLeaderboard> {
    const response = await apiRequest('/api/gamification/leaderboard/', {
        method: 'GET',
    });
    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            'Класацията не може да бъде заредена.',
        ));
    }
    return response.json();
}

export async function updateLeaderboardPreference(
    leaderboardOptIn: boolean,
): Promise<{ leaderboard_opt_in: boolean }> {
    const response = await apiRequest('/api/gamification/preferences/', {
        method: 'PATCH',
        body: JSON.stringify({ leaderboard_opt_in: leaderboardOptIn }),
    });
    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            'Настройката за класацията не може да бъде запазена.',
        ));
    }
    return response.json();
}

export async function recordGamificationActivity(
    action: 'post_read' | 'calendar_visit',
    options: { objectId?: number; engagementSeconds?: number } = {},
): Promise<void> {
    const response = await apiRequest('/api/gamification/activity/', {
        method: 'POST',
        body: JSON.stringify({
            action,
            object_id: options.objectId,
            engagement_seconds: options.engagementSeconds,
        }),
    });
    if (!response.ok && response.status !== 429) {
        throw new Error(await getApiErrorMessage(
            response,
            'Активността не може да бъде отчетена.',
        ));
    }
}

export interface PublicProfileUser {
    id: number;
    username: string;
    avatar_url: string | null;
    email: string | null;
    member_since: string;
}

export interface PublicProfileBadge {
    slug: string;
    title: string;
    description: string;
    icon: string;
    rarity: GamificationBadgeRarity;
    awarded_at: string;
}

export interface PublicDigitalReward {
    key: string;
    title: string;
    kind: 'avatar_frame' | 'profile_border' | 'profile_theme' | 'user_title' | 'special_icon';
    config: Record<string, unknown>;
    unlocked_at: string;
    selected: boolean;
}

export interface PublicProfileComment {
    id: number;
    post_id: number;
    post_title: string;
    content: string;
    created_at: string;
}

export interface PublicUserProfile {
    user: PublicProfileUser;
    is_owner: boolean;
    profile_is_public: boolean;
    email_is_public: boolean;
    comments_are_public: boolean;
    bio: string;
    level: GamificationLevel | null;
    points: number;
    badges: PublicProfileBadge[];
    rewards: PublicDigitalReward[];
    stats: {
        comments: number;
        approved_memes: number;
        approved_songs: number;
        poll_answers: number;
        badges: number;
        rewards: number;
    };
    recent_comments: PublicProfileComment[];
    comments_visible: boolean;
}

export async function getPublicUserProfile(username: string): Promise<PublicUserProfile> {
    const response = await apiRequest(
        `/api/users/${encodeURIComponent(username)}/profile/`,
        { method: 'GET' },
    );
    if (!response.ok) {
        throw new Error(await getApiErrorMessage(
            response,
            response.status === 404
                ? 'Профилът не съществува или е скрит.'
                : 'Профилът не може да бъде зареден.',
        ));
    }
    const data = await response.json() as PublicUserProfile;
    return {
        ...data,
        user: {
            ...data.user,
            avatar_url: resolveApiUrl(data.user.avatar_url) || null,
        },
    };
}
