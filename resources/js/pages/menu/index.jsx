import AppLayout from "@/components/layout/app-layout";
import { Tree, TreeItem, TreeItemContent } from "@/components/ui/tree";
import { usePage } from "@inertiajs/react";
import { Collection } from "react-aria-components";

export default function Menu() {
    const { menus } = usePage().props;
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <h1 className="text-xl font-bold">Menu</h1>
                <Tree>
                    {function renderItem(item) {
                        return <TreeItem id={item.id}>
                            <TreeItemContent>
                                {({ collapsed, hasChildItems }) => <>
                                    <div className="w-8 h-8 flex items-center justify-center">
                                        <Icon size={16} />
                                    </div>
                                    {!collapsed && <>
                                        {item.title}
                                        {hasChildItems || <div className="shrink-0 h-8" />}
                                    </>}
                                </>}
                            </TreeItemContent>
                            <Collection>
                                {renderItem}
                            </Collection>
                        </TreeItem>
                    }}
                </Tree>
            </div>
        </AppLayout>
    );
}