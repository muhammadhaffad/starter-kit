import { usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { toast } from "sonner";

function FlashMessages() {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.info) toast.message(flash.info);
    }, [flash]);

    return null;
}

export default FlashMessages;