import { useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query";
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset, SidebarTrigger } from "@/components/layout/sidebar";

export default function Test() {
    console.info(useMediaQuery("(max-width: 767px)"));
    const [open, setOpen] = useState(false)
    return (
        <SidebarProvider >
            <Sidebar collapsible="dock">
                <SidebarContent>
                    <div className="space-y-1">
                        {Array.from({ length: 50 }).map((_, index) => (
                            <div key={index} className="bg-red-300 rounded-lg group-data-[state=collapsed]:w-[2rem]">
                                asdaaaaaaaaaaaaaaaaaaaaaaaaaa
                            </div>
                        ))}
                    </div>
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <div>
                    <SidebarTrigger />
                </div>
                <div className="h-screen">
                    <h1>Test</h1>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}