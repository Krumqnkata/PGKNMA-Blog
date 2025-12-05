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
    
    // ❗ Заменете с реалния URL на вашия Django API
    const API_URL = 'http://localhost:8000/api/posts/'; 

    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // 'credentials: 'include'' се добавя, ако Django използва сесийни бисквитки
        });

        if (!response.ok) {
            // Хвърляне на грешка при HTTP статус 4xx или 5xx
            console.error(`HTTP грешка при зареждане на постове: ${response.status}`);
            return null; 
        }

        // Убеждаваме се, че данните отговарят на интерфейса Post[]
        const data: Post[] = await response.json();
        return data;

    } catch (error) {
        console.error('Грешка при комуникация с API за постове:', error);
        return null; // Връщане на null при грешка в мрежата
    }
}