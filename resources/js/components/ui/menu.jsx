import { Check, ChevronRight } from "lucide-react"
import React from "react"
import {
	Menu as AriaMenu,
	MenuItem as AriaMenuItem,
	MenuSection as AriaMenuSection,
	Separator,
	composeRenderProps,
	Header,
	Collection
} from "react-aria-components"
import { dropdownItemStyles } from "./listbox"
import { Popover } from "./popover"

export function Menu(props) {
	return (
		<Popover placement={props.placement} className="min-w-[150px]">
			<AriaMenu
				{...props}
				className="p-1 outline-0 max-h-[inherit] overflow-auto [clip-path:inset(0_0_0_0_round_.75rem)]"
			/>
		</Popover>
	)
}

export function MenuItem(props) {
	let textValue =
		props.textValue ||
		(typeof props.children === "string" ? props.children : undefined)
	return (
		<AriaMenuItem
			textValue={textValue}
			{...props}
			className={dropdownItemStyles}
			variant={props.variant}
		>
			{composeRenderProps(
				props.children,
				(children, { selectionMode, isSelected, hasSubmenu }) => (
					<>
						{selectionMode !== "none" && (
							<span className="flex items-center w-4">
								{isSelected && <Check aria-hidden className="w-4 h-4" />}
							</span>
						)}
						<span className="flex items-center flex-1 gap-2 font-normal truncate group-selected:font-semibold">
							{children}
						</span>
						{hasSubmenu && (
							<ChevronRight aria-hidden className="absolute w-4 h-4 right-2" />
						)}
					</>
				)
			)}
		</AriaMenuItem>
	)
}

export function MenuSeparator(props) {
	return (
		<Separator
			{...props}
			className="mx-3 my-1 border-b border-gray-300 dark:border-zinc-700"
		/>
	)
}

export function MenuSection(props) {
	return (
		<AriaMenuSection
			{...props}
			className="first:-mt-[5px] after:content-[''] after:block after:h-[5px]"
		>
			{props.title && (
				<Header className="text-sm font-semibold text-gray-500 dark:text-zinc-300 px-4 py-1 truncate sticky -top-[5px] -mt-px -mx-1 z-10 bg-gray-100/60 dark:bg-zinc-700/60 backdrop-blur-md supports-[-moz-appearance:none]:bg-gray-100 border-y border-y-gray-200 dark:border-y-zinc-700 [&+*]:mt-1">
					{props.title}
				</Header>
			)}
			<Collection items={props.items}>{props.children}</Collection>
		</AriaMenuSection>
	)
}
