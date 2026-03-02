export interface Review {
    author_name: string;
    author_url: string;
    language?: string;
    original_language?: string;
    profile_photo_url: string;
    rating: number;
    relative_time_description: string;
    text: string;
    time: number;
    translated?: boolean;
}

export interface Restaurant {
    _id?: string; // MongoDB ID
    id?: string; // Google Place ID
    websiteSlug?: string; // Generated Website Slug
    name: string;
    address?: string;
    phone?: string;
    cuisine?: string;
    price_range?: string;
    rating?: number;
    user_ratings_total?: number;
    website?: string;
    photos?: string[];
    reviews?: Review[];
    types?: string[];
    location?: {
        lat: number;
        lng: number;
    } | string; // Updated to allow string string if that's what comes from backend sometimes, or just handle mismatch
    latitude?: number;
    longitude?: number;
    opening_hours?: string[];
    price_level?: number;
    web_config?: WebConfig;
    created_at?: string;
    updated_at?: string;
    websiteGenerated?: boolean;
    emailSent?: boolean;
    emails?: Array<{
        id: string;
        subject: string;
        sent_at?: string;
        sentAt?: string;
        status: string;
    }>;
}

export interface EmailDetail {
    place_id: string;
    subject: string;
    body: string;
    status: string;
    sent_at: string;
    recipient: string;
}

export interface WebConfig {
    design: {
        layout: string;
        typography: string;
        galleryLayout: string;
        colors: {
            primary: string;
            secondary: string;
            accent: string;
            background: string;
            surface: string;
            text: string;
        };
    };
    languages: string[];
    defaultLanguage?: string;
    content: Record<string, any>;
    backgroundImages?: string[];
    slug?: string;
    thumbnail?: string;
    socials?: {
        instagram?: string;
        facebook?: string;
        twitter?: string;
        tiktok?: string;
    };
    contact?: {
        email?: string;
        phone?: string;
        whatsapp?: string;
    };
    suggested_domains?: string[];
}

export interface SearchResult {
    id: string; // Google Place ID
    name: string;
    rating?: number;
    address?: string;
    photos?: string[];
    reviews?: any[];
    user_ratings_total?: number;
}

export interface SearchResponse {
    query: string;
    location: string;
    total_results: number;
    limit: number;
    results: SearchResult[];
    next_page_token?: string;
}

export interface Stats {
    total_restaurants: number;
    average_rating: number;
    total_reviews: number;
    top_cuisines: Array<{ cuisine: string; count: number }>;
    price_distribution: Record<string, number>;
    total_generated_websites: number;
    hidden_gems_count: number;
    fix_me_count: number;
}
