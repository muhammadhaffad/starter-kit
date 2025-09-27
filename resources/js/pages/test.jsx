import { useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query";
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset, SidebarTrigger, SidebarNav, SidebarHeader, SidebarLabel, SidebarTree, SidebarTreeItem, SidebarTreeItemContent, SidebarFooter } from "@/components/layout/sidebar";
import * as Lucide from 'lucide-react';
import { Breadcrumb, Breadcrumbs } from "@/components/ui/breadcrumbs";
import { usePage } from "@inertiajs/react";
import { Header, MenuTrigger, Pressable, Text } from "react-aria-components";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuSection, MenuSeparator } from "@/components/ui/menu";


export default function Test({ }) {
    const { currentPath, breadcrumbs } = usePage().props;
    return (
        <SidebarProvider >
            <Sidebar collapsible="dock">
                <SidebarHeader>
                    <div className="flex gap-x-2">
                        <div className="w-[31px] h-[31px] bg-amber-300 flex items-center justify-center rounded">
                            <Lucide.User size={18} />
                        </div>
                        <SidebarLabel>
                            <p>Test</p>
                        </SidebarLabel>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarTree selectionMode="single" defaultSelectedKeys={[]} disallowEmptySelection>
                        <SidebarTreeItem
                            id="documents"
                            textValue="Documents"
                        >
                            <SidebarTreeItemContent icon={<Lucide.Folder size={16} />}>
                                Documents
                            </SidebarTreeItemContent>
                            <SidebarTreeItem
                                id="project"
                                textValue="Project"
                            >
                                <SidebarTreeItemContent icon={<Lucide.Folder size={16} />}>
                                    Project
                                </SidebarTreeItemContent>
                                <SidebarTreeItem
                                    id="report"
                                    textValue="Weekly Report"
                                >
                                    <SidebarTreeItemContent icon={<Lucide.File size={16} />}>
                                        Weekly Report
                                    </SidebarTreeItemContent>
                                </SidebarTreeItem>
                            </SidebarTreeItem>
                        </SidebarTreeItem>
                        <SidebarTreeItem
                            id="photos"
                            textValue="Photos"
                        >
                            <SidebarTreeItemContent icon={<Lucide.Images size={16} />}>
                                Photos
                            </SidebarTreeItemContent>
                            <SidebarTreeItem
                                id="one"
                                textValue="Image 1"
                            >
                                <SidebarTreeItemContent icon={<Lucide.Image size={16} />}>
                                    Image 1
                                </SidebarTreeItemContent>
                            </SidebarTreeItem>
                            <SidebarTreeItem
                                id="two"
                                textValue="Image 2"
                            >
                                <SidebarTreeItemContent icon={<Lucide.Image size={16} />}>
                                    Image 2
                                </SidebarTreeItemContent>
                            </SidebarTreeItem>
                        </SidebarTreeItem>
                    </SidebarTree>
                </SidebarContent>
                <SidebarFooter className={"group-data-[state=collapsed]:p-2"}>
                    <MenuTrigger>
                        <Button variant="icon" className="dark:hover:bg-transparent dark:pressed:bg-transparent hover:bg-transparent pressed:bg-transparent group-data-[state=collapsed]:p-0 flex items-center justify-between gap-2 w-full">
                            <div className="flex items-center gap-2">
                                <img
                                    alt=""
                                    src="https://intentui.com/images/avatar/cobain.jpg"
                                    className="w-8 h-8 rounded-full"
                                />
                                <div className="flex flex-col items-start -space-y-1 group-data-[state=collapsed]:hidden text-nowrap">
                                    <span className="block">Kurt Cobain</span>
                                    <span className="font-normal text-muted-foreground">@cobain</span>
                                </div>
                            </div>
                            <Lucide.ChevronsUpDown size={16} className="group-data-[state=collapsed]:hidden" />
                        </Button>
                        <Menu>
                            <Header>
                                <div className="-space-y-1 px-2 py-1">
                                    <span className="block">Kurt Cobain</span>
                                    <span className="font-normal text-muted-foreground">@cobain</span>
                                </div>
                            </Header>
                            <MenuSeparator />
                            <MenuItem>
                                <Lucide.Gauge size={16} />
                                Dashboard
                            </MenuItem>
                            <MenuItem>
                                <Lucide.Settings size={16} />
                                Settings
                            </MenuItem>
                            <MenuItem>
                                <Lucide.Shield size={16} />
                                Security
                            </MenuItem>
                            <MenuSeparator />
                            <MenuItem variant="danger">
                                <Lucide.LogOut size={16} />
                                Logout
                            </MenuItem>
                        </Menu>
                    </MenuTrigger>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <SidebarNav>
                    <SidebarTrigger className={'p-2'}>
                        <Lucide.Sidebar size={20} />
                    </SidebarTrigger>
                    <Breadcrumbs>
                        {breadcrumbs.map((path, index) => (
                            <Breadcrumb key={index} href={index === breadcrumbs.length - 1 ? null : path.url}>{path.title}</Breadcrumb>
                        ))}
                    </Breadcrumbs>
                </SidebarNav>
                <div className="h-screen">
                    <h1>Test</h1>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}