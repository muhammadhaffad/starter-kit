import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
import {
    Tree as AriaTree,
    TreeItem as AriaTreeItem,
    TreeItemContent as AriaTreeItemContent
} from "react-aria-components"
import { ChevronRight } from "lucide-react"
import { tv } from "tailwind-variants"
import { Checkbox } from "@/components/ui/checkbox"
import { composeTailwindRenderProps, focusRing } from "@/components/ui/utils"
import { useMediaQuery } from "@/hooks/use-media-query";
import { twJoin, twMerge } from "tailwind-merge";
import { Button } from "@/components/ui/button";
import * as Lucide from "lucide-react";
import { SheetContent } from "@/components/ui/sheet";
import { Text } from "react-aria-components";

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
                    "flex min-h-svh w-full text-sidebar-foreground",
                    "group/sidebar-root peer/sidebar-root has-data-[intent=inset]:bg-sidebar dark:has-data-[intent=inset]:bg-background",
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
                    "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
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
                <SheetContent
                    isOpen={isOpenOnMobile}
                    onOpenChange={setIsOpenOnMobile}
                    closeButton={closeButton}
                    aria-label="Sidebar"
                    data-slot="sidebar"
                    data-intent="default"
                    data-state={state}
                    className="group w-(--sidebar-width) [--sidebar-width:18rem] has-data-[slot=calendar]:[--sidebar-width:23rem] bg-background"
                    side={side}
                >
                    {children}
                </SheetContent>
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
            className="group peer hidden text-sidebar-foreground md:block"
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
                    "bg-background p-2 group-data-[collapsible=dock]:w-[calc(--spacing(4)+2px)]",
                    intent === "inset" &&
                    "bg-sidebar group-data-[collapsible=dock]:w-[calc(var(--sidebar-width-dock)+--spacing(2)+2px)] dark:bg-background",
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
                        "flex h-full w-full flex-col text-sidebar-foreground",
                        "group-data-[intent=inset]:bg-sidebar dark:group-data-[intent=inset]:bg-background",
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

const SidebarFooter = ({ className, children, ...props }) => {
    const { state } = useSidebar();
    return (
        <div
            data-slot="sidebar-footer"
            className={twMerge([
                "mt-auto flex shrink-0 items-center justify-center p-4 **:data-[slot=chevron]:text-muted-foreground",
                "in-data-[intent=inset]:px-6 in-data-[intent=inset]:py-4",
                className
            ])}
            {...props}
        >
            {typeof children === "function" ? children({ state }) : children}
        </div>
    )
}

const SidebarContent = ({ className, ...props }) => {
    const { state } = useSidebar()
    return (
        <div
            data-slot="sidebar-content"
            className={twMerge(
                "flex min-h-0 flex-1 scroll-mb-96 flex-col overflow-y-auto overflow-x-hidden *:data-[slot=sidebar-section]:border-l-0 px-4 md:px-0",
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
                "isolate flex items-center justify-between gap-x-2 px-(--container-padding,--spacing(4)) py-2.5 text-foreground sm:justify-start sm:px-(--gutter,--spacing(4)) md:w-full",
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
                "relative flex w-full flex-1 flex-col bg-background lg:min-w-0",
                "peer-data-[intent=inset]:border peer-data-[intent=inset]:border-sidebar-border md:peer-data-[intent=inset]:peer-data-[state=collapsed]:ml-2 md:peer-data-[intent=inset]:m-2 md:peer-data-[intent=inset]:ml-0 md:peer-data-[intent=inset]:rounded-2xl",
                "peer-data-[intent=inset]:bg-background dark:peer-data-[intent=inset]:bg-sidebar h-screen overflow-hidden",
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
            className={twMerge(className, "shrink-0")}
            onPress={event => {
                onPress?.(event)
                toggleSidebar()
            }}
            variant="icon"
            {...props}
        >
            {children || (
                <>
                    <Lucide.Sidebar />
                    <span className="sr-only">Toggle Sidebar</span>
                </>
            )}
        </Button>
    )
}

const SidebarLabel = ({ className, ref, ...props }) => {
    const { state, isMobile } = useSidebar()
    const collapsed = state === "collapsed" && !isMobile
    if (!collapsed) {
        return (
            <Text
                data-slot="sidebar-label"
                tabIndex={-1}
                ref={ref}
                slot="label"
                className={twMerge(
                    "col-start-2 overflow-hidden whitespace-nowrap outline-hidden",
                    className
                )}
                {...props}
            >
                {props.children}
            </Text>
        )
    }
    return null
}

const itemStyles = tv({
    extend: focusRing,
    base:
        "relative flex group gap-3 cursor-default select-none group-data-[state=collapsed]:m-2.5 group-data-[state=expanded]:mx-4 group-data-[state=expanded]:p-1 text-sm text-gray-900 dark:text-zinc-200 -mb-px last:mb-0 -outline-offset-2 text-nowrap rounded",
    variants: {
        isSelected: {
            false: "hover:bg-gray-100 dark:hover:bg-zinc-700/60",
            true:
                "bg-blue-100 dark:bg-blue-700/30 hover:bg-blue-200 dark:hover:bg-blue-700/40 z-20"
        },
        isDisabled: {
            true:
                "text-slate-300 dark:text-zinc-600 forced-colors:text-[GrayText] z-10"
        }
    }
})

function Tree({ children, ...props }) {
    return (
        <AriaTree
            {...props}
            className={composeTailwindRenderProps(
                props.className,
                "relative "
            )}
        >
            {children}
        </AriaTree>
    )
}

function TreeItem(props) {
    return <AriaTreeItem className={itemStyles} {...props} />
}

const expandButton = tv({
    extend: focusRing,
    base:
        "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-start cursor-default",
    variants: {
        isDisabled: {
            true: "text-gray-300 dark:text-zinc-600 forced-colors:text-[GrayText]"
        }
    }
})

const chevron = tv({
    base:
        "w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ease-in-out",
    variants: {
        isExpanded: {
            true: "transform rotate-90"
        },
        isDisabled: {
            true: "text-gray-300 dark:text-zinc-600 forced-colors:text-[GrayText]"
        }
    }
})

function TreeItemContent({ children, ...props }) {
    const { state, isMobile } = useSidebar();
    const collapsed = state === "collapsed" && !isMobile
    return (
        <AriaTreeItemContent {...props}>
            {({
                selectionMode,
                selectionBehavior,
                hasChildItems,
                isExpanded,
                isDisabled
            }) => (
                <div className={`flex w-full items-center justify-between`}>
                    {selectionMode === "multiple" && selectionBehavior === "toggle" && (
                        <Checkbox slot="selection" />
                    )}
                    <div className="flex items-center w-full p-1 md:p-0">
                        <div className="shrink-0 group-data-[state=expanded]:w-[calc(calc(var(--tree-item-level)_-_1)_*_calc(var(--spacing)_*_3))]" />
                        {typeof children === "function" ? children({ collapsed, hasChildItems }) : children}
                    </div>
                    {!collapsed && hasChildItems && (
                        <Button slot="chevron" variant="icon" className={expandButton({ isDisabled })}>
                            <ChevronRight
                                aria-hidden
                                className={chevron({ isExpanded, isDisabled })}
                            />
                        </Button>
                    )}
                </div>
            )}
        </AriaTreeItemContent>
    )
}

export {
    SidebarProvider,
    SidebarNav,
    SidebarHeader,
    SidebarContent,
    Tree as SidebarTree,
    TreeItem as SidebarTreeItem,
    TreeItemContent as SidebarTreeItemContent,
    SidebarInset,
    SidebarFooter,
    Sidebar,
    SidebarTrigger,
    SidebarLabel,
    useSidebar
}

