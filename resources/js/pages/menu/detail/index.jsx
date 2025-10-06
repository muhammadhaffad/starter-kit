import { Button } from "@/components/ui/button";
import { ComboBox, ComboBoxItem } from "@/components/ui/ComboBox";
import { Label } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { TextField } from "@/components/ui/text-field";
import { useForm } from "@inertiajs/react";
import { Group, Pressable } from "react-aria-components";
import * as Lucide from "lucide-react";
import AppLayout from "@/components/layout/app-layout";

export default function MenuDetail({ permissions, menu, routes }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: menu?.name ?? "",
        icon: menu?.icon ?? "",
        route: menu?.route ?? "",
        menu_active_pattern: menu?.menu_active_pattern ?? "",
        permissions: menu?.permissions?.map((permission) => ({
            menu_id: permission.pivot.menu_id,
            permission_id: permission.id,
            route: permission.pivot.route,
        })) ?? [{
            menu_id: menu?.id,
            permission_id: null,
            route: null,
        }],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (menu?.id) {
            put(route('menus.update', menu.id), {
                onSuccess: () => {
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
        <AppLayout>
            <div className="col-span-1 flex flex-col gap-4 max-w-lg">
                <h2 className="text-lg font-semibold">{
                    menu?.id ? `Edit Menu ${menu.name}` : "Add Menu"
                }</h2>
                <Form onSubmit={handleSubmit} validationErrors={errors}>
                    <input type="hidden" name="id" defaultValue={menu?.id} />
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
                    <ComboBox
                        label="URL"
                        name="route"
                        items={routes.map((route) => ({ id: route, label: route }))}
                        placeholder="Select route"
                        selectedKey={data.route}
                        onSelectionChange={(value) => setData('route', value)}
                    >
                        {(item) => <ComboBoxItem id={item.id}>{item.label}</ComboBoxItem>}
                    </ComboBox>
                    <TextField
                        label="Menu Active Pattern"
                        name="menu_active_pattern"
                        value={data.menu_active_pattern}
                        onChange={(value) => setData('menu_active_pattern', value)}
                    />
                    <fieldset>
                        <Group className="w-full space-y-2">
                            <div className="flex justify-between mb-0 items-end">
                                <Label>Permissions (Route - Permission)</Label>
                                <Pressable onPress={() => {
                                    setData('permissions', [...data.permissions, {
                                        menu_id: menu?.id,
                                        permission_id: null,
                                        route: null,
                                    }])
                                }}>
                                    <span className="flex items-center gap-1 text-sm text-blue-500 cursor-pointer">
                                        <Lucide.Plus size={16} /> Add
                                    </span>
                                </Pressable>
                            </div>
                            {data.permissions.map((pair_permission, index) => (
                                <Group className="flex flex-col items-end md:flex-row gap-2 md:items-center">
                                    <Group className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                                        <ComboBox
                                            name={`permissions.${index}.route`}
                                            items={routes.map((route) => ({ id: route, label: route }))}
                                            placeholder="Select route"
                                            defaultSelectedKey={pair_permission.route}
                                            className="w-full"
                                            isRequired
                                            onSelectionChange={(value) => setData('permissions', data.permissions.map((pair_permission, i) => i === index ? { ...pair_permission, route: value } : pair_permission))}
                                        >
                                            {(item) => <ComboBoxItem id={item.id}>{item.label}</ComboBoxItem>}
                                        </ComboBox>
                                        <ComboBox
                                            items={permissions.map((permission) => ({ id: permission.id, label: permission.name }))}
                                            name={`permissions.${index}.permission_id`}
                                            placeholder="Select permission"
                                            defaultSelectedKey={pair_permission.permission_id}
                                            className="w-full"
                                            isRequired
                                            onSelectionChange={(value) => setData('permissions', data.permissions.map((pair_permission, i) => i === index ? { ...pair_permission, permission_id: value } : pair_permission))}
                                        >
                                            {(item) => <ComboBoxItem id={item.id}>{item.label}</ComboBoxItem>}
                                        </ComboBox>
                                    </Group>
                                    <Button variant="icon" className="disabled:opacity-50" onPress={() => {
                                        setData('permissions', data.permissions.filter((pair_permission, i) => i !== index))
                                    }} isDisabled={index === 0}>
                                        <Lucide.Trash2 size={16} className="text-red-500" />
                                    </Button>
                                </Group>
                            ))}
                        </Group>
                    </fieldset>
                    <div className="flex gap-2 justify-end">
                        <Button variant="secondary" className="w-min" onClick={() => reset()}>Reset</Button>
                        <Button className="w-min" isDisabled={processing} type="submit">Save</Button>
                    </div>
                </Form>
            </div>
        </AppLayout>
    )
}