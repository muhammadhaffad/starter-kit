import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { twJoin, twMerge } from "tailwind-merge";
import { Button } from "react-aria-components";

const SIDEBAR_WIDTH = "17rem"
const SIDEBAR_WIDTH_DOCK = "3.25rem"
const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

const SidebarContext = createContext(null);

const useSidebar = () => {
    const context = use(SidebarContext)
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider.")
    }

    return context
}

const SidebarProvider = ({
    defaultOpen = true,
    isOpen: openProp,
    onOpenChange: setOpenProp,
    className,
    style,
    children,
    shortcut = "b",
    ref,
    ...props
}) => {
    const [openMobile, setOpenMobile] = useState(false)

    const [internalOpenState, setInternalOpenState] = useState(defaultOpen)
    const open = openProp ?? internalOpenState
    const setOpen = useCallback(
        value => {
            const openState = typeof value === "function" ? value(open) : value

            if (setOpenProp) {
                setOpenProp(openState)
            } else {
                setInternalOpenState(openState)
            }

            document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
        },
        [setOpenProp, open]
    )

    const isMobile = useMediaQuery("(max-width: 767px)");

    const toggleSidebar = useCallback(() => {
        return isMobile ? setOpenMobile(open => !open) : setOpen(open => !open)
    }, [isMobile, setOpen])

    useEffect(() => {
        const handleKeyDown = event => {
            if (event.key === shortcut && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                toggleSidebar()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar, shortcut])

    const state = open ? "expanded" : "collapsed"

    const contextValue = useMemo(
        () => ({
            state,
            open,
            setOpen,
            isMobile: isMobile ?? false,
            isOpenOnMobile: openMobile,
            setIsOpenOnMobile: setOpenMobile,
            toggleSidebar
        }),
        [state, open, setOpen, isMobile, openMobile, toggleSidebar]
    )

    if (isMobile === undefined) {
        return null
    }

    return (
        <SidebarContext value={contextValue}>
            <div
                style={{
                    "--sidebar-width": SIDEBAR_WIDTH,
                    "--sidebar-width-dock": SIDEBAR_WIDTH_DOCK,
                    ...style
                }}
                className={twMerge(
                    "@container **:data-[slot=icon]:shrink-0",
                    "flex min-h-svh w-full text-sidebar-fg",
                    "group/sidebar-root peer/sidebar-root has-data-[intent=inset]:bg-sidebar dark:has-data-[intent=inset]:bg-bg",
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </div>
        </SidebarContext>
    )
}

const Sidebar = ({
    children,
    closeButton = true,
    collapsible = "hidden",
    side = "left",
    intent = "default",
    className,
    ...props
}) => {
    const { isMobile, state, isOpenOnMobile, setIsOpenOnMobile } = useSidebar()

    if (collapsible === "none") {
        return (
            <div
                data-intent={intent}
                data-collapsible="none"
                data-slot="sidebar"
                className={twMerge(
                    "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-fg",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }

    if (isMobile) {
        return (
            <>
                <span className="sr-only" aria-hidden data-intent={intent} />
                {/* <SheetContent
                    isOpen={isOpenOnMobile}
                    onOpenChange={setIsOpenOnMobile}
                    closeButton={closeButton}
                    aria-label="Sidebar"
                    data-slot="sidebar"
                    data-intent="default"
                    className="w-(--sidebar-width) [--sidebar-width:18rem] has-data-[slot=calendar]:[--sidebar-width:23rem]"
                    side={side}
                >
                    {children}
                </SheetContent> */}
            </>
        )
    }

    return (
        <div
            data-state={state}
            data-collapsible={state === "collapsed" ? collapsible : ""}
            data-intent={intent}
            data-side={side}
            data-slot="sidebar"
            className="group peer hidden text-sidebar-fg md:block"
            {...props}
        >
            <div
                data-slot="sidebar-gap"
                aria-hidden="true"
                className={twMerge([
                    "w-(--sidebar-width) group-data-[collapsible=hidden]:w-0",
                    "group-data-[side=right]:rotate-180",
                    "relative h-svh bg-transparent transition-[width] duration-200 ease-linear",
                    intent === "default" &&
                    "group-data-[collapsible=dock]:w-(--sidebar-width-dock)",
                    intent === "float" &&
                    "group-data-[collapsible=dock]:w-[calc(var(--sidebar-width-dock)+(--spacing(4)))]",
                    intent === "inset" &&
                    "group-data-[collapsible=dock]:w-[calc(var(--sidebar-width-dock)+--spacing(2))]"
                ])}
            />
            <div
                data-slot="sidebar-container"
                className={twMerge(
                    "fixed inset-y-0 z-10 hidden h-svh min-h-svh w-(--sidebar-width) bg-sidebar",
                    "not-has-data-[slot=sidebar-footer]:pb-2",
                    "transition-[left,right,width] duration-200 ease-linear",
                    "md:flex",
                    side === "left" &&
                    "left-0 group-data-[collapsible=hidden]:left-[calc(var(--sidebar-width)*-1)]",
                    side === "right" &&
                    "right-0 group-data-[collapsible=hidden]:right-[calc(var(--sidebar-width)*-1)]",
                    intent === "float" &&
                    "bg-bg p-2 group-data-[collapsible=dock]:w-[calc(--spacing(4)+2px)]",
                    intent === "inset" &&
                    "bg-sidebar group-data-[collapsible=dock]:w-[calc(var(--sidebar-width-dock)+--spacing(2)+2px)] dark:bg-bg",
                    intent === "default" && [
                        "group-data-[collapsible=dock]:w-(--sidebar-width-dock)",
                        "group-data-[side=left]:border-sidebar-border group-data-[side=right]:border-sidebar-border group-data-[side=left]:border-r group-data-[side=right]:border-l"
                    ],
                    className
                )}
                {...props}
            >
                <div
                    data-sidebar="default"
                    data-slot="sidebar-inner"
                    className={twJoin(
                        "flex h-full w-full flex-col text-sidebar-fg",
                        "group-data-[intent=inset]:bg-sidebar dark:group-data-[intent=inset]:bg-bg",
                        "group-data-[intent=float]:rounded-lg group-data-[intent=float]:border group-data-[intent=float]:border-sidebar-border group-data-[intent=float]:bg-sidebar group-data-[intent=float]:shadow-xs"
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    )
}

const SidebarHeader = ({ className, ref, ...props }) => {
    const { state } = useSidebar()
    return (
        <div
            ref={ref}
            data-slot="sidebar-header"
            className={twMerge(
                "flex flex-col gap-2 [.border-b]:border-sidebar-border",
                "in-data-[intent=inset]:p-4",
                state === "collapsed" ? "p-2.5" : "p-4",
                className
            )}
            {...props}
        />
    )
}

const SidebarFooter = ({ className, ...props }) => {
    return (
        <div
            data-slot="sidebar-footer"
            className={twMerge([
                "mt-auto flex shrink-0 items-center justify-center p-4 **:data-[slot=chevron]:text-muted-fg",
                "in-data-[intent=inset]:px-6 in-data-[intent=inset]:py-4",
                className
            ])}
            {...props}
        />
    )
}

const SidebarContent = ({ className, ...props }) => {
    const { state } = useSidebar()
    return (
        <div
            data-slot="sidebar-content"
            className={twMerge(
                "flex min-h-0 flex-1 scroll-mb-96 flex-col overflow-auto *:data-[slot=sidebar-section]:border-l-0",
                state === "collapsed" ? "items-start" : "mask-b-from-95%",
                className
            )}
            {...props}
        >
            {props.children}
        </div>
    )
}

const SidebarNav = ({ isSticky = false, className, ...props }) => {
    return (
        <nav
            data-slot="sidebar-nav"
            className={twMerge(
                "isolate flex items-center justify-between gap-x-2 px-(--container-padding,--spacing(4)) py-2.5 text-navbar-fg sm:justify-start sm:px-(--gutter,--spacing(4)) md:w-full",
                isSticky &&
                "static top-0 z-40 group-has-data-[intent=default]/sidebar-root:sticky",
                className
            )}
            {...props}
        />
    )
}

const SidebarInset = ({ className, ref, ...props }) => {
    return (
        <main
            ref={ref}
            className={twMerge(
                "relative flex w-full flex-1 flex-col bg-bg lg:min-w-0",
                "peer-data-[intent=inset]:border peer-data-[intent=inset]:border-sidebar-border md:peer-data-[intent=inset]:peer-data-[state=collapsed]:ml-2 md:peer-data-[intent=inset]:m-2 md:peer-data-[intent=inset]:ml-0 md:peer-data-[intent=inset]:rounded-2xl",
                "peer-data-[intent=inset]:bg-bg dark:peer-data-[intent=inset]:bg-sidebar",
                className
            )}
            {...props}
        />
    )
}

const SidebarTrigger = ({ onPress, className, children, ...props }) => {
    const { toggleSidebar } = useSidebar()
    return (
        <Button
            aria-label={props["aria-label"] || "Toggle Sidebar"}
            data-slot="sidebar-trigger"
            intent={props.intent || "plain"}
            size={props.size || "sq-sm"}
            className={twMerge(className, "shrink-0")}
            onPress={event => {
                onPress?.(event)
                toggleSidebar()
            }}
            {...props}
        >
            {children || (
                <>
                    {'>'}
                    <span className="sr-only">Toggle Sidebar</span>
                </>
            )}
        </Button>
    )
}

export {
    SidebarProvider,
    SidebarNav,
    SidebarHeader,
    SidebarContent,
    SidebarInset,
    SidebarFooter,
    Sidebar,
    SidebarTrigger,
}
