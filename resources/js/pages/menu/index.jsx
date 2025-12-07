import AppLayout from "@/components/layout/app-layout";
import { Tree, TreeItem, TreeItemContent } from "@/components/ui/Tree";
import { Collection, DialogTrigger, useDragAndDrop } from "react-aria-components";
import * as Lucide from "lucide-react";
import { useTreeData } from "react-stately";
import { Tag, TagGroup } from "@/components/ui/TagGroup";
import { Button } from "@/components/ui/Button";
import { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { twMerge } from "tailwind-merge";
import { Modal } from "@/components/ui/Modal";
import { AlertDialog } from "@/components/ui/AlertDialog";
import AppHead from "@/components/layout/app-head";
import { Link } from "@/components/ui/Link";

export default function Menu({ menus }) {
    return (
        <AppLayout>
            <div className="grid grid-cols-1 gap-6 items-start">
                <AppHead title="Menus" />
                <div className="col-span-full flex items-center gap-2">
                    <h1 className="text-xl font-bold">Menu</h1>
                    /
                    <Link href={route('menus.create')} className="text-blue-500">
                        Create Menu
                    </Link>
                </div>
                <TreeMenu menus={menus} className="col-span-full" />
            </div>
        </AppLayout >
    );
}

function TreeMenu({ menus, className }) {
    let treeMenu = useTreeData({
        initialItems: menus
    });

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
        },
    });

    const oldMenus = useRef(treeMenu.items);
    useEffect(() => {
        const diffMenus = [];
        const oldMenusFlatten = flattenMenus(oldMenus.current).sort((a, b) => a.id - b.id);
        const newMenusFlatten = flattenMenus(treeMenu.items).sort((a, b) => a.id - b.id);


        if (oldMenusFlatten.length === newMenusFlatten.length) {
            for (let i = 0; i < newMenusFlatten.length; i++) {
                if (newMenusFlatten[i].order_index !== oldMenusFlatten[i].order_index || newMenusFlatten[i].parent_id !== oldMenusFlatten[i].parent_id) {
                    diffMenus.push(newMenusFlatten[i]);
                }
            }
        }
        if (diffMenus.length > 0) {
            oldMenus.current = treeMenu.items;
            diffMenus.forEach(menu => {
                router.put(route('menus.update-order'), {
                    menu_id: menu.id,
                    order: menu.order_index,
                    parent_id: menu.parent_id
                });
            });
        }
    }, [treeMenu.items]);

    return (
        <Tree
            items={treeMenu.items}
            dragAndDropHooks={dragAndDropHooks}
            className={twMerge("col-span-2", className)}
        >
            {function renderItem(item) {
                return <TreeItem id={item.id}>
                    <TreeItemContent className="w-full cursor-move">
                        {({ hasChildItems }) => {
                            const Icon = Lucide[item.value.icon];
                            return <>
                                <div className="w-8 h-8 flex items-center justify-center">
                                    <Icon size={16} />
                                </div>
                                {item.value.title}
                                {hasChildItems || <div className="shrink-0 h-8" />}
                                <div className="ml-auto flex gap-1 items-center [&_div]:justify-end">
                                    {item.value.permissions.length > 0 && <TagGroup className="ml-auto">
                                        {item.value.permissions.map((permission) => (
                                            <Tag key={permission.id}>{permission.name}</Tag>
                                        ))}
                                    </TagGroup>}
                                    <Link href={route('menus.detail', item.value.id)} variant="icon">
                                        <Lucide.Edit3 size={16} className="text-yellow-500" />
                                    </Link>
                                    <DialogTrigger>
                                        <Button variant="icon" className="flex w-min items-center cursor-pointer">
                                            <Lucide.Trash2 size={16} className="text-red-500" />
                                        </Button>
                                        <Modal>
                                            <AlertDialog actionLabel="Delete" title="Delete Role" variant="destructive" className="p-6" onAction={() => router.delete(route('menus.destroy', item.value.id), {
                                                onSuccess: () => {
                                                    router.reload({ only: ['menus'] });
                                                }
                                            })}>
                                                Are you sure you want to delete this menu?
                                            </AlertDialog>
                                        </Modal>
                                    </DialogTrigger>
                                </div>
                            </>
                        }}
                    </TreeItemContent>
                    <Collection items={item.children}>
                        {renderItem}
                    </Collection>
                </TreeItem>
            }}
        </Tree>
    )
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