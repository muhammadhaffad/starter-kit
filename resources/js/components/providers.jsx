import { router } from "@inertiajs/react"
import { RouterProvider } from "react-aria-components"

export function Providers({ children }) {
    return (
        <RouterProvider navigate={(to, options) => router.visit(to, options)}>
            {children}
        </RouterProvider>
    )
}