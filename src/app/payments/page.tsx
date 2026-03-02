import { Metadata } from "next";
import { PaymentsList } from "./_components/payments-list";

export const metadata: Metadata = {
    title: "Payments | restAbot",
    description: "Manage payments and subscriptions",
};

export default function PaymentsPage() {
    return <PaymentsList />;
}
