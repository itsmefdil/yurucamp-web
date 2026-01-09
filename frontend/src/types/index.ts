export interface User {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    bio?: string;
    phone?: string;
    googleId?: string;
    updatedAt?: string;
}

export interface Activity {
    id: string;
    title: string;
    description?: string;
    category?: string;
    date?: string;
    location?: string;
    imageUrl?: string;
    additionalImages?: string[];
    userId: string;
    createdAt: string;
}

export interface CampArea {
    id: string;
    name: string;
    description?: string;
    location?: string;
    price?: string;
    imageUrl?: string;
    additionalImages?: string[];
    facilities?: string[];
    userId: string;
    createdAt: string;
}

export interface Event {
    id: string;
    title: string;
    description?: string;
    location: string;
    dateStart: string;
    dateEnd?: string;
    imageUrl?: string;
    price?: string;
    maxParticipants?: number;
    organizerId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface EventParticipant {
    id: string;
    eventId: string;
    userId: string;
    createdAt: string;
}

export interface Comment {
    id: string;
    content: string;
    createdAt: string;
    userId: string;
    user?: {
        fullName?: string;
        avatarUrl?: string;
    };
}

export interface VideoInteractions {
    comments: Comment[];
    likeCount: number;
}
