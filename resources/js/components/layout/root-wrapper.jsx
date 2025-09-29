import React, { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { Toaster, toast } from "sonner";

export default function RootWrapper({ children }) {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.info) toast.message(flash.info);
    }, [flash]);

    return (
        <>
            {children}
            <Toaster richColors position="top-right" />
        </>
    );
}