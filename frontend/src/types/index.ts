export interface User {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    bio?: string;
    phone?: string;
    googleId?: string;
    createdAt?: string;
    updatedAt?: string;
    role?: 'user' | 'admin' | string;
    regionId?: string | null;
    // EXP System
    exp?: number;
    level?: number;
    levelName?: string;
    expToNextLevel?: number;
}

export interface Activity {
    id: string;
    title: string;
    description?: string;
    categoryId?: string;
    date?: string;
    location?: string;
    regionId?: string | null;
    imageUrl?: string;
    additionalImages?: string[];
    userId: string;
    createdAt: string;
    user?: User;
    category?: {
        id: string;
        name: string;
    } | string;
    region?: {
        id: string;
        name: string;
        slug: string;
    };
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
    user?: {
        id: string;
        fullName?: string;
        avatarUrl?: string;
        level?: number;
        exp?: number;
        levelName?: string;
    };
}

export interface Event {
    id: string;
    title: string;
    description?: string;
    location: string;
    dateStart: string;
    dateEnd?: string;
    regionId?: string | null;
    region?: {
        id: string;
        name: string;
        slug: string;
        imageUrl?: string | null;
    };
    imageUrl?: string;
    price?: string;
    maxParticipants?: number;
    organizerId?: string;
    organizer?: User;
    participants?: (User & { seatCount?: number })[];
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

export interface Category {
    id: string;
    name: string;
    createdAt: string;
}

