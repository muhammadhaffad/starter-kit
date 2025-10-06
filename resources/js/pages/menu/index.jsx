import AppLayout from "@/components/layout/app-layout";
import { Tree, TreeItem, TreeItemContent } from "@/components/ui/tree";
import { Collection, DialogTrigger, useDragAndDrop } from "react-aria-components";
import * as Lucide from "lucide-react";
import { useTreeData } from "react-stately";
import { Tag, TagGroup } from "@/components/ui/TagGroup";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { router, useForm } from "@inertiajs/react";
import { Form } from "@/components/ui/form";
import { Select, SelectItem } from "@/components/ui/Select";
import { TextField } from "@/components/ui/text-field";
import { twMerge } from "tailwind-merge";
import { Modal } from "@/components/ui/modal";
import { AlertDialog } from "@/components/ui/AlertDialog";
import AppHead from "@/components/layout/app-head";

export default function Menu({ menus, permissions }) {
    const [keyTree, setKeyTree] = useState(1);
    const [selectedMenu, setSelectedMenu] = useState(null);

    return (
        <AppLayout>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <AppHead title="Menus" />
                <div className="col-span-full">
                    <h1 className="text-xl font-bold">Menu</h1>
                </div>
                <TreeMenu menus={menus} className="col-span-full md:col-span-2" setSelectedMenu={setSelectedMenu} key={keyTree} />
                <TreeMenuForm permissions={permissions} className="col-span-full md:col-span-1" selectedMenu={selectedMenu} setSelectedMenu={setSelectedMenu} key={selectedMenu?.id} setKeyTree={setKeyTree} />
            </div>
        </AppLayout >
    );
}

function TreeMenu({ menus, className, setSelectedMenu }) {
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
                    <TreeItemContent className="w-full">
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
                                    <Button variant="icon" onPress={() => setSelectedMenu(item.value)}>
                                        <Lucide.Edit3 size={16} className="text-yellow-500" />
                                    </Button>
                                    <DialogTrigger>
                                        <Button variant="icon" className="flex w-min items-center ">
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

function TreeMenuForm({ permissions, className, selectedMenu, setSelectedMenu, setKeyTree }) {
    const { data, setData, post, put, processing, errors, reset, setDefaults } = useForm({
        title: selectedMenu?.title ?? "",
        icon: selectedMenu?.icon ?? "",
        route: selectedMenu?.route ?? "",
        menu_active_pattern: selectedMenu?.menu_active_pattern ?? "",
        permissions: selectedMenu?.permissions?.map((permission) => permission.id) ?? [],
        pair_permissions: selectedMenu?.permissions?.map((permission) => ({
            menu_id: permission.pivot.menu_id,
            permission_id: permission.id,
            route: permission.pivot.route,
        })) ?? [],
    });
    console.info(data);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedMenu?.id) {
            put(route('menus.update', selectedMenu.id), {
                onSuccess: () => {
                    setSelectedMenu(null);
                    router.reload({
                        only: ['menus'], onSuccess: () => {
                            setKeyTree((prev) => prev + 1);
                        }
                    });
                }
            });
        } else {
            post(route('menus.add'), {
                onSuccess: () => {
                    reset();
                    router.reload({
                        only: ['menus'], onSuccess: () => {
                            setKeyTree((prev) => prev + 1);
                        }
                    });
                }
            });
        }
    }
    return (
        <div className={twMerge("col-span-1 flex flex-col gap-4 p-4 border rounded-xl", className)}>
            <h2 className="text-lg font-semibold">{
                selectedMenu?.id ? `Edit Menu ${selectedMenu.title}` : "Add Menu"
            }</h2>
            <Form onSubmit={handleSubmit} validationErrors={errors}>
                <input type="hidden" name="id" defaultValue={selectedMenu?.id} />
                <TextField
                    label="Title"
                    name="title"
                    isRequired
                    value={data.title}
                    onChange={(value) => setData('title', value)}
                />
                <TextField
                    label="Icon"
                    name="icon"
                    description={<>Component name from Lucide, please refer to <a className="text-blue-500" href="https://lucide.dev/icons">Lucide Icons</a></>}
                    isRequired
                    value={data.icon}
                    onChange={(value) => setData('icon', value)}
                />
                <TextField
                    label="Route"
                    name="route"
                    value={data.route}
                    onChange={(value) => setData('route', value)}
                />
                <TextField
                    label="Menu Active Pattern"
                    name="menu_active_pattern"
                    value={data.menu_active_pattern}
                    onChange={(value) => setData('menu_active_pattern', value)}
                />
                <Select
                    label="Permissions"
                    name="permissions"
                    items={permissions}
                    selectionMode="multiple"
                    placeholder="Select permissions"
                    selectValue={
                        ({ selectedItems, defaultChildren, isPlaceholder }) => (
                            isPlaceholder || selectedItems.length === 1
                                ? defaultChildren
                                : `${selectedItems.map(item => item.name).join(', ')}`
                        )
                    }
                    value={data.permissions}
                    onChange={(selected) => setData('permissions', selected)}
                    isRequired
                >
                    {permission => (
                        <SelectItem id={permission.id}>{permission.name}</SelectItem>
                    )}
                </Select>
                <div className="flex gap-2 justify-end">
                    <Button variant="secondary" className="w-min" onClick={() => (setSelectedMenu(null), reset())}>Reset</Button>
                    <Button className="w-min" isDisabled={processing} type="submit">Save</Button>
                </div>
            </Form>
        </div>
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