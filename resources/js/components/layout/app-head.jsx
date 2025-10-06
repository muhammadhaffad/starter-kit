import { usePage } from '@inertiajs/react'

const AppHead = ({ title, children }) => {
    const { app_name } = usePage().props
    return (
        <>
            <title>{title ? `${title} - ${app_name}` : app_name}</title>
            {children}
        </>
    )
}

export default AppHead