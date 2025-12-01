export interface Activity {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    date: string | null;
    location: string | null;
    image_url: string | null;
    additional_images: string[] | null;
    user_id: string | null;
    created_at: string;
    profiles?: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
}
