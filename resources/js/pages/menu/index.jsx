import AppLayout from "@/components/layout/app-layout";
import { Tree, TreeItem, TreeItemContent } from "@/components/ui/tree";
import { Collection, useDragAndDrop } from "react-aria-components";
import * as Lucide from "lucide-react";
import { useTreeData } from "react-stately";
import { Tag, TagGroup } from "@/components/ui/TagGroup";

export default function Menu({ menus }) {
    let treeMenu = useTreeData({
        initialItems: menus
    });

    console.info(flattenMenus(treeMenu.items));

    let { dragAndDropHooks } = useDragAndDrop({
        getItems: (keys) =>
            [...keys].map((key) => ({
                'text/plain': treeMenu.getItem(key).value.title
            })),
        onMove(e) {
            if (e.target.dropPosition === 'before') {
                treeMenu.moveBefore(e.target.key, e.keys);
            } else if (e.target.dropPosition === 'after') {
                treeMenu.moveAfter(e.target.key, e.keys);
            } else if (e.target.dropPosition === 'on') {
                // Move items to become children of the target
                let targetNode = treeMenu.getItem(e.target.key);
                if (targetNode) {
                    let targetIndex = targetNode.children
                        ? targetNode.children.length
                        : 0;
                    let keyArray = Array.from(e.keys);
                    for (let i = 0; i < keyArray.length; i++) {
                        treeMenu.move(keyArray[i], e.target.key, targetIndex + i);
                    }
                }
            }
        }
    });

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <h1 className="text-xl font-bold">Menu</h1>
                <Tree
                    items={treeMenu.items}
                    selectionMode="single"
                    dragAndDropHooks={dragAndDropHooks}
                >
                    {function renderItem(item) {
                        return <TreeItem id={item.id}>
                            <TreeItemContent className="w-full">
                                {({ hasChildItems }) => {
                                    const Icon = Lucide[item.value.icon];
                                    return <>
                                        <div className="w-8 h-8 flex items-center justify-center">
                                            <Icon size={16} />
                                        </div>
                                        {item.value.title}
                                        {hasChildItems || <div className="shrink-0 h-8" />}
                                        {item.value.permissions.length > 0 && <TagGroup className="ml-auto">
                                            {item.value.permissions.map((permission) => (
                                                <Tag key={permission.id}>{permission.name}</Tag>
                                            ))}
                                        </TagGroup>}
                                    </>
                                }}
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

function flattenMenus(tree) {
    const result = [];

    function traverse(nodes, parentId = null) {
        nodes.forEach((node, index) => {
            const { value, children } = node;
            const flatItem = {
                id: Number(value.id),
                parent_id: parentId ? Number(parentId) : null,
                order_index: index + 1,
                title: value.title,
                type: value.type,
                icon: value.icon,
                route: value.route,
                permissions: value.permissions || []
            };

            result.push(flatItem);

            if (children && children.length > 0) {
                traverse(children, value.id);
            }
        });
    }

    traverse(tree, null);
    return result;
}