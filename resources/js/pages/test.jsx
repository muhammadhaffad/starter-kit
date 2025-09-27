import { useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query";
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset, SidebarTrigger, SidebarNav, SidebarHeader, SidebarLabel } from "@/components/layout/sidebar";
import * as Lucide from 'lucide-react';
import { Breadcrumb, Breadcrumbs } from "@/components/ui/breadcrumbs";
import { usePage } from "@inertiajs/react";
import { Tree, TreeItem, TreeItemContent } from "@/components/layout/sidebar-menu";


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
                    <Tree>
                        <TreeItem
                            id="documents"
                            textValue="Documents"
                        >
                            <TreeItemContent>
                                Documents
                            </TreeItemContent>
                            <TreeItem
                                id="project"
                                textValue="Project"
                            >
                                <TreeItemContent>
                                    Project
                                </TreeItemContent>
                                <TreeItem
                                    id="report"
                                    textValue="Weekly Report"
                                >
                                    <TreeItemContent>
                                        Weekly Report
                                    </TreeItemContent>
                                </TreeItem>
                            </TreeItem>
                        </TreeItem>
                        <TreeItem
                            id="photos"
                            textValue="Photos"
                        >
                            <TreeItemContent>
                                Photos
                            </TreeItemContent>
                            <TreeItem
                                id="one"
                                textValue="Image 1"
                            >
                                <TreeItemContent>
                                    Image 1
                                </TreeItemContent>
                            </TreeItem>
                            <TreeItem
                                id="two"
                                textValue="Image 2"
                            >
                                <TreeItemContent>
                                    Image 2
                                </TreeItemContent>
                            </TreeItem>
                        </TreeItem>
                    </Tree>
                </SidebarContent>
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