import AppHead from "@/components/layout/app-head";
import AppLayout from "@/components/layout/app-layout";


export default function Dashboard({ }) {
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <AppHead title="Dashboard" />
                <h1 className="text-xl font-bold">Dashboard</h1>
            </div>
        </AppLayout>
    )
}