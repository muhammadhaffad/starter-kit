import AppLayout from "@/components/layout/app-layout";

export default function UserDetail({ user }) {
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <h1 className="text-xl font-bold">User Detail</h1>
            </div>
        </AppLayout>
    );
}