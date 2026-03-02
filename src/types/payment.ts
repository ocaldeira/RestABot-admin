export interface Payment {
    _id: string;
    id: string;
    slug: string;
    amount_total: number;
    currency: string;
    customer_email: string;
    customer_name: string;
    customer_phone: string | null;
    customer_id: string;
    subscription_id: string | null;
    payment_intent_id: string | null;
    invoice_id: string | null;
    stripe_created: number;
    status: string;
    payment_status: string;
    metadata: {
        plan: string;
        restaurant_id: string;
        slug: string;
    };
    mode: string;
    description?: string;
    created_at: string;
    deleted_at?: string;
}
