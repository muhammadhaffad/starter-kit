import { createContext, use, useEffect, useState } from "react"

const initialState = {
    theme: "system",
    setTheme: () => null
}

const ThemeProviderContext = createContext(initialState)

function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "iut",
    ...props
}) {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage?.getItem(storageKey) || defaultTheme
        }
        return defaultTheme
    })

    useEffect(() => {
        if (typeof window !== "undefined") {
            const root = window.document.body
            

            root.classList.remove("light", "dark")

            if (theme === "system") {
                const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                    .matches
                    ? "dark"
                    : "light"
                root.classList.add(systemTheme)
                return
            }

            root.classList.add(theme)
        }
    }, [theme])

    const value = {
        theme,
        setTheme: theme => {
            if (typeof window !== "undefined") {
                localStorage.setItem(storageKey, theme)
            }
            setTheme(theme)
        }
    }

    return (
        <ThemeProviderContext {...props} value={value}>
            {children}
        </ThemeProviderContext>
    )
}

const useTheme = () => {
    const context = use(ThemeProviderContext)
    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")
    return context
}

export { ThemeProvider, useTheme }
