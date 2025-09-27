import { ChevronRight } from "lucide-react"
import React from "react"
import {
	Breadcrumb as AriaBreadcrumb,
	Breadcrumbs as AriaBreadcrumbs
} from "react-aria-components"
import { twMerge } from "tailwind-merge"
import { Link } from "./link"
import { composeTailwindRenderProps } from "./utils"

export function Breadcrumbs(props) {
	return (
		<AriaBreadcrumbs
			{...props}
			className={twMerge("flex gap-1", props.className)}
		/>
	)
}

export function Breadcrumb(props) {
	return (
		<AriaBreadcrumb
			{...props}
			className={composeTailwindRenderProps(
				props.className,
				"flex items-center gap-1"
			)}
		>
			<Link variant="secondary" {...props} />
			{props.href && (
				<ChevronRight className="w-3 h-3 text-gray-600 dark:text-zinc-400" />
			)}
		</AriaBreadcrumb>
	)
}
