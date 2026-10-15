import PrimaryButton from "@/Components/PrimaryButton";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, useForm } from "@inertiajs/react";
import { useEffect } from "react";

export default function ForgotPassword({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    useEffect(() => {
        post(route("password.email"));
    }, []);

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-4 text-sm text-gray-600">
                A password reset link will be sent automatically to the admin
                email address on file. No email entry is required.
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="mt-4 flex items-center justify-end">
                <PrimaryButton className="ms-4" disabled={processing}>
                    {processing ? "Sending reset link..." : "Send reset link"}
                </PrimaryButton>
            </div>
        </GuestLayout>
    );
}
