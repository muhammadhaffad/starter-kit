import React from "react"
import {
    Tree as AriaTree,
    TreeItem as AriaTreeItem,
    TreeItemContent as AriaTreeItemContent,
    Button
} from "react-aria-components"
import { ChevronRight } from "lucide-react"
import { tv } from "tailwind-variants"
import { Checkbox } from "@/components/ui/checkbox"
import { composeTailwindRenderProps, focusRing } from "@/components/ui/utils"
import { useSidebar } from "./sidebar"

const itemStyles = tv({
    extend: focusRing,
    base:
        "relative flex group gap-3 cursor-default select-none py-2 px-3 text-sm text-gray-900 dark:text-zinc-200 -mb-px last:mb-0 -outline-offset-2",
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

export function Tree({ children, ...props }) {
    return (
        <AriaTree
            {...props}
            className={composeTailwindRenderProps(
                props.className,
                "overflow-auto relative "
            )}
        >
            {children}
        </AriaTree>
    )
}

export function TreeItem(props) {
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

export function TreeItemContent({ children, ...props }) {
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
                    <div className="flex items-center">
                        <div className="w-8 h-8">
                            X
                        </div>
                        {!collapsed && <>
                            <div className="shrink-0 w-[calc(calc(var(--tree-item-level)_-_1)_*_calc(var(--spacing)_*_3))]" />
                            {hasChildItems || <div className="shrink-0 h-8" />}
                            {children}
                        </>}
                    </div>
                    {!collapsed && hasChildItems && (
                        <Button slot="chevron" className={expandButton({ isDisabled })}>
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
