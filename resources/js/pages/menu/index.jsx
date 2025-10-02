import AppLayout from "@/components/layout/app-layout";
import { Tree, TreeItem, TreeItemContent } from "@/components/ui/tree";
import { usePage } from "@inertiajs/react";
import { Collection } from "react-aria-components";
import * as Lucide from "lucide-react";
import { useTreeData } from "react-stately";

export default function Menu() {
    const { menus } = usePage().props;
    let treeMenu = useTreeData({
        initialItems: menus
    });
    console.log(treeMenu.items);
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <h1 className="text-xl font-bold">Menu</h1>
                <Tree
                    items={treeMenu.items}
                    selectionMode="multiple"
                >
                    {function renderItem(item) {
                        const Icon = Lucide[item.icon]; 
                        return <TreeItem id={item.id}>
                            <TreeItemContent>
                                {({ hasChildItems }) => <>
                                    <div className="w-8 h-8 flex items-center justify-center">
                                        <Icon size={16} />
                                    </div>
                                    {item.title}
                                    {hasChildItems || <div className="shrink-0 h-8" />}
                                </>}
                            </TreeItemContent>
                            <Collection items={item.children}>
                                {renderItem}
                            </Collection>
                        </TreeItem>
                    }}
                </Tree>
            </div>
        </AppLayout>
    );
}