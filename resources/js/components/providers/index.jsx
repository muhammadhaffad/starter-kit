import { router } from "@inertiajs/react"
import { RouterProvider } from "react-aria-components"
import { ThemeProvider } from "./theme-provider"

export function Providers({ children }) {
    return (
        <RouterProvider navigate={(to, options) => router.visit(to, options)}>
            <ThemeProvider>{children}</ThemeProvider>
        </RouterProvider>
    )
}