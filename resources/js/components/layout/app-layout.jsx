import { SidebarProvider, Sidebar, SidebarContent, SidebarInset, SidebarTrigger, SidebarNav, SidebarHeader, SidebarLabel, SidebarTree, SidebarTreeItem, SidebarTreeItemContent, SidebarFooter } from "@/components/layout/sidebar";
import * as Lucide from 'lucide-react';
import { Breadcrumb, Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Form, Link, router, usePage } from "@inertiajs/react";
import { Collection, Header, MenuTrigger, Pressable, Text } from "react-aria-components";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuSection, MenuSeparator } from "@/components/ui/menu";
import RootWrapper from "@/components/layout/root-wrapper";
import { useRef } from "react";
import { twMerge } from "tailwind-merge";
import { useTheme } from "@/components/providers/theme-provider";

export default function AppLayout({ children }) {
    const { user, breadcrumbs, menus, menusFlatten, menuActive, app_logo, app_name } = usePage().props;
    const { theme, setTheme } = useTheme()
    const menuExpanded = JSON.parse(menusFlatten.find(menu => menu.id == menuActive)?.path_order.replace('{', '[').replace('}', ']') || '[]');
    const logoutRef = useRef();
    return (
        <RootWrapper>
            <SidebarProvider >
                <Sidebar collapsible="dock">
                    <SidebarHeader>
                        <div className="flex gap-x-2 items-center">
                            <div className="w-[31px] h-[31px] p-1 bg-white flex items-center justify-center rounded shrink-0">
                                <img src={app_logo} alt="" />
                            </div>
                            <SidebarLabel>
                                <p className="text-ellipsis overflow-hidden font-bold">{app_name}</p>
                            </SidebarLabel>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarTree items={menus} onSelectionChange={(key) => {
                            const menu = menusFlatten.find(menu => menu.id == [...key].pop());
                            if (menu) {
                                router.visit(route(menu.route));
                            }
                        }} selectionMode="single" selectedKeys={menuActive?.toString().split(',')} defaultExpandedKeys={menuExpanded.toString().split(',')} disallowEmptySelection>
                            {function renderItem(item) {
                                const Icon = Lucide[item.icon];
                                return <SidebarTreeItem
                                    id={item.id}
                                    textValue={item.title}
                                    style={{
                                        cursor: item.route ? "pointer" : "default"
                                    }}
                                >
                                    <SidebarTreeItemContent>
                                        {({ collapsed, hasChildItems }) => <>
                                            <div className="w-8 h-8 flex items-center justify-center">
                                                <Icon size={16} />
                                            </div>
                                            {!collapsed && <>
                                                {item.title}
                                                {hasChildItems || <div className="shrink-0 h-8" />}
                                            </>}
                                        </>}
                                    </SidebarTreeItemContent>
                                    <Collection items={item.children}>
                                        {renderItem}
                                    </Collection>
                                </SidebarTreeItem>
                            }}
                        </SidebarTree>
                    </SidebarContent>
                    <SidebarFooter className={"group-data-[state=collapsed]:p-2.5"}>
                        {({ state }) => <MenuTrigger>
                            <Button variant="icon" className="dark:hover:bg-transparent dark:pressed:bg-transparent hover:bg-transparent pressed:bg-transparent group-data-[state=collapsed]:p-0 flex items-center justify-between gap-2 w-full">
                                <div className="flex items-center gap-2">
                                    <img
                                        alt=""
                                        src="https://intentui.com/images/avatar/cobain.jpg"
                                        className="w-8 h-8 rounded-full"
                                    />
                                    {state === "expanded" && <div className="flex flex-col items-start -space-y-1 text-nowrap">
                                        <span className="block">{user?.name}</span>
                                        <span className="font-normal text-muted-foreground">{user?.email}</span>
                                    </div>}
                                </div>
                                {state === "expanded" && <Lucide.ChevronsUpDown size={16} />}
                            </Button>
                            <Menu>
                                <Header>
                                    <div className="-space-y-1 px-2 py-1">
                                        <span className="block">{user?.name}</span>
                                        <span className="text-sm font-normal text-muted-foreground">{user?.email}</span>
                                    </div>
                                </Header>
                                <MenuSeparator />
                                <MenuItem href="/dashboard">
                                    <Lucide.Gauge size={16} />
                                    Dashboard
                                </MenuItem>
                                <MenuItem href="/account-settings">
                                    <Lucide.Settings size={16} />
                                    Settings
                                </MenuItem>
                                <MenuSeparator />
                                <MenuItem onPress={() => { logoutRef.current.submit() }} >
                                    <Form ref={logoutRef} action="/logout" method="post" className="sr-only" />
                                    <Lucide.LogOut size={16} />
                                    Logout
                                </MenuItem>
                            </Menu>
                        </MenuTrigger>}
                    </SidebarFooter>
                </Sidebar>
                <SidebarInset>
                    <SidebarNav>
                        <div className="flex gap-2">
                            <SidebarTrigger className={'p-2'}>
                                <Lucide.Sidebar size={16} />
                            </SidebarTrigger>
                            <Breadcrumbs>
                                {breadcrumbs?.map((path, index) => (
                                    <Breadcrumb key={index} href={index === breadcrumbs.length - 1 ? "#" : path.url} className={twMerge("flex items-center gap-2", path.url && "cursor-pointer")}>
                                        {path.title}
                                    </Breadcrumb>
                                ))}
                            </Breadcrumbs>
                        </div>
                        <Button
                            className="relative aspect-square ml-auto p-2"
                            variant="icon"
                            aria-label="Switch theme"
                            onPress={() => setTheme(theme === "light" ? "dark" : "light")}
                        >
                            <Lucide.Sun size={16} className="transition-all scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
                            <Lucide.Moon size={16} className="absolute transition-all scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
                        </Button>
                    </SidebarNav>
                    <div className="p-4 overflow-auto">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </RootWrapper>
    );
}