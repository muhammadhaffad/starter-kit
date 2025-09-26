import { useEffect, useState } from "react"

export const useMediaQuery = (query) => {
    const [value, setValue] = useState()

    useEffect(() => {
        const onChange = (event) => {
            setValue(event.matches)
        }

        const result = matchMedia(query)
        setValue(result.matches)
        result.addEventListener("change", onChange)

        return () => result.removeEventListener("change", onChange)
    }, [query])

    return value
}