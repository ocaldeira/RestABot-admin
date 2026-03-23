import {
    Restaurant,
    SearchResponse,
    Stats,
    WebConfig,
    EmailDetail,
} from "@/types/restaurant";
import { Payment } from "@/types/payment";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
}

export const api = {
    // Search for restaurants
    searchRestaurants: async (
        query: string,
        location: string,
        limit: number = 20,
        pagetoken?: string
    ): Promise<SearchResponse> => {
        const params = new URLSearchParams({
            query,
            location,
            limit: limit.toString(),
        });
        if (pagetoken) {
            params.append("pagetoken", pagetoken);
        }
        const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`);
        return handleResponse<SearchResponse>(response);
    },

    // Generate Web Config (Create)
    createWebConfig: async (propertyId: string): Promise<WebConfig> => {
        const response = await fetch(
            `${API_BASE_URL}/create?propertyId=${propertyId}`,
            {
                method: "POST",
            }
        );
        return handleResponse<WebConfig>(response);
    },

    // Get Admin Stats
    getStats: async (): Promise<Stats> => {
        const response = await fetch(`${API_BASE_URL}/admin/stats`);
        return handleResponse<Stats>(response);
    },

    // Get Restaurants List
    getRestaurants: async (
        skip: number = 0,
        limit: number = 20,
        query: string = "",
        filterWebsite: boolean | null = null,
        filterEmail: boolean | null = null,
        hasWebsite: boolean | null = null,
        hasEmail: boolean | null = null,
        hasPhone: boolean | null = null
    ): Promise<{ restaurants: Restaurant[]; total: number }> => {
        let url = `${API_BASE_URL}/admin/restaurants?skip=${skip}&limit=${limit}`;
        if (query) {
            url += `&query=${encodeURIComponent(query)}`;
        }
        if (filterWebsite !== null) {
            url += `&websiteGenerated=${filterWebsite}`;
        }
        if (filterEmail !== null) {
            url += `&emailSent=${filterEmail}`;
        }
        if (hasWebsite !== null) {
            url += `&hasWebsite=${hasWebsite}`;
        }
        if (hasEmail !== null) {
            url += `&hasEmail=${hasEmail}`;
        }
        if (hasPhone !== null) {
            url += `&hasPhone=${hasPhone}`;
        }
        const response = await fetch(url);
        return handleResponse<{ restaurants: Restaurant[]; total: number }>(
            response
        );
    },

    // Get Restaurant Detail
    getRestaurant: async (id: string): Promise<Restaurant> => {
        const response = await fetch(`${API_BASE_URL}/admin/restaurants/${id}`);
        return handleResponse<Restaurant>(response);
    },

    // Update Restaurant
    updateRestaurant: async (
        id: string,
        data: Partial<Restaurant>
    ): Promise<Restaurant> => {
        const response = await fetch(`${API_BASE_URL}/admin/restaurants/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return handleResponse<Restaurant>(response);
    },

    // Delete Restaurant
    deleteRestaurant: async (id: string): Promise<{ success: boolean }> => {
        const response = await fetch(`${API_BASE_URL}/admin/restaurants/${id}`, {
            method: "DELETE",
        });
        return handleResponse<{ success: boolean }>(response);
    },
    // Generate/Send Email (or Preview)
    generateEmail: async (propertyId: string, preview: boolean = false): Promise<{ success: boolean; message?: string; draft?: any }> => {
        const url = preview
            ? `${API_BASE_URL}/generateEmail?propertyId=${propertyId}&preview=true`
            : `${API_BASE_URL}/generateEmail?propertyId=${propertyId}`;

        const response = await fetch(url, {
            method: "POST",
        });
        return handleResponse<{ success: boolean; message?: string; draft?: any }>(response);
    },

    // Send Draft Email
    sendDraftEmail: async (draft: any): Promise<{ success: boolean; message?: string }> => {
        const response = await fetch(`${API_BASE_URL}/admin/send-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(draft),
        });
        return handleResponse<{ success: boolean; message?: string }>(response);
    },

    // Generate WhatsApp Message (AI)
    generateWhatsApp: async (propertyId: string, preview: boolean = false): Promise<{ success: boolean; message?: string; draft?: any }> => {
        const url = preview
            ? `${API_BASE_URL}/admin/generate-whatsapp?propertyId=${propertyId}&preview=true`
            : `${API_BASE_URL}/admin/generate-whatsapp?propertyId=${propertyId}`;
        const response = await fetch(url, { method: "POST" });
        return handleResponse<{ success: boolean; message?: string; draft?: any }>(response);
    },

    // Send WhatsApp (Register log and get wa.me link)
    sendDraftWhatsApp: async (draft: any): Promise<{ success: boolean; whatsapp_url: string }> => {
        const response = await fetch(`${API_BASE_URL}/admin/send-whatsapp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(draft),
        });
        return handleResponse<{ success: boolean; whatsapp_url: string }>(response);
    },

    // Get Email Content
    getEmailContent: async (emailId: string): Promise<EmailDetail> => {
        const response = await fetch(`${API_BASE_URL}/admin/emails/${emailId}`);
        if (!response.ok) throw new Error("Failed to load email");
        const data = await response.json();
        return data;
    },

    // Generate Website Preview
    generateThumbnail: async (slug: string): Promise<{ success: boolean; message?: string }> => {
        const response = await fetch(`${API_BASE_URL}/websites/${slug}/thumbnail`, {
            method: "POST",
        });
        return handleResponse<{ success: boolean; message?: string }>(response);
    },

    // Get Web Config (View)
    getWebConfig: async (placeId: string): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/admin/restaurants/${placeId}/config`);
        return handleResponse<any>(response);
    },

    // Update Web Config
    updateWebConfig: async (placeId: string, config: any): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/admin/restaurants/${placeId}/config`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(config),
        });
        return handleResponse<any>(response);
    },

    // Validate Domain
    validateDomain: async (domain: string): Promise<{ available: boolean; message?: string }> => {
        const response = await fetch(`${API_BASE_URL}/validate-domain?domain=${encodeURIComponent(domain)}`);
        return handleResponse<{ available: boolean; message?: string }>(response);
    },

    // ── Payments ──────────────────────────────────────────────

    // Get Payments List
    getPayments: async (
        skip: number = 0,
        limit: number = 20,
        query: string = ""
    ): Promise<{ payments: Payment[]; total: number }> => {
        let url = `${API_BASE_URL}/admin/payments?skip=${skip}&limit=${limit}`;
        if (query) {
            url += `&query=${encodeURIComponent(query)}`;
        }
        const response = await fetch(url);
        return handleResponse<{ payments: Payment[]; total: number }>(response);
    },

    // Get Payment Detail
    getPayment: async (id: string): Promise<Payment> => {
        const response = await fetch(`${API_BASE_URL}/admin/payments/${id}`);
        return handleResponse<Payment>(response);
    },

    // Delete Payment (soft delete)
    deletePayment: async (id: string): Promise<{ success: boolean }> => {
        const response = await fetch(`${API_BASE_URL}/admin/payments/${id}`, {
            method: "DELETE",
        });
        return handleResponse<{ success: boolean }>(response);
    },

    // Update Payment (description & status only)
    updatePayment: async (
        id: string,
        data: { description?: string; status?: string }
    ): Promise<Payment> => {
        const response = await fetch(`${API_BASE_URL}/admin/payments/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return handleResponse<Payment>(response);
    },

    // Upload Logo/Image to Backend
    uploadFile: async (placeId: string, file: File, type: "logo_main" | "logo_secondary" | "hero" | "gallery"): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        const response = await fetch(`${API_BASE_URL}/admin/restaurants/${placeId}/upload`, {
            method: "POST",
            body: formData,
            // Note: Don't set Content-Type header, browser will set it with boundary
        });
        return handleResponse<{ url: string }>(response);
    },

    // Upload Menu Photos for AI Transcription
    uploadMenuPhotos: async (placeId: string, files: FileList | File[]): Promise<{ menu: any[] }> => {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }

        const response = await fetch(`${API_BASE_URL}/admin/restaurants/${placeId}/menu/upload`, {
            method: "POST",
            body: formData,
        });
        return handleResponse<{ menu: any[] }>(response);
    },

    // Sync Restaurant Photos from Google to Azure
    syncRestaurantPhotos: async (placeId: string, force: boolean = false): Promise<{
        status: 'success' | 'skipped';
        newLY_uploaded?: number;
        total_photos_in_db?: number;
        message?: string;
    }> => {
        const url = `${API_BASE_URL}/admin/restaurants/${placeId}/sync-photos${force ? '?force=true' : ''}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return handleResponse(response);
    },
};
