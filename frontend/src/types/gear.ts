export interface GearItem {
    id: string;
    categoryId: string;
    name: string;
    description?: string;
    weight: string; // Numeric string from DB
    quantity: number;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface GearCategory {
    id: string;
    gearListId: string;
    name: string;
    sortOrder: number;
    items: GearItem[];
    createdAt: string;
}

export interface GearList {
    id: string;
    userId: string;
    name: string;
    description?: string;
    isPublic: boolean;
    isOwner?: boolean;
    ownerInfo?: { fullName: string | null; avatarUrl: string | null };
    categories?: GearCategory[];
    createdAt: string;
    updatedAt: string;
}

export interface ItemFormData {
    name: string;
    description: string;
    weight: string;
    quantity: number;
}
