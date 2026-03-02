import { Metadata } from "next";
import { PaymentDetailView } from "./_components/payment-detail-view";

export const metadata: Metadata = {
    title: "Payment Details | restAbot",
    description: "View and edit payment details",
};

type Props = {
    params: Promise<{ id: string }>;
};

export default async function PaymentPage({ params }: Props) {
    const { id } = await params;
    return <PaymentDetailView id={id} />;
}
