import { SidebarProvider, Sidebar, SidebarContent, SidebarInset, SidebarTrigger, SidebarNav, SidebarHeader, SidebarLabel, SidebarTree, SidebarTreeItem, SidebarTreeItemContent, SidebarFooter } from "@/components/layout/sidebar";
import * as Lucide from 'lucide-react';
import { Breadcrumb, Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Form, usePage } from "@inertiajs/react";
import { Header, MenuTrigger, Pressable, Text } from "react-aria-components";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuSection, MenuSeparator } from "@/components/ui/menu";
import RootWrapper from "@/components/layout/root-wrapper";
import AppLayout from "@/components/layout/app-layout";


export default function Test({ }) {
    const { currentPath, breadcrumbs } = usePage().props;
    return (
        <AppLayout>
            asdasdas
        </AppLayout>
    )
}