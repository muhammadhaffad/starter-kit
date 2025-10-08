import AppHead from "@/components/layout/app-head";
import AppLayout from "@/components/layout/app-layout";
import { AlertDialog } from "@/components/ui/AlertDialog";
import { Button } from "@/components/ui/button";
import { ComboBox, ComboBoxItem } from "@/components/ui/ComboBox";
import { Form } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { Cell, Column, Row, Table, TableHeader } from "@/components/ui/table";
import { Tag, TagGroup } from "@/components/ui/TagGroup";
import { TextField } from "@/components/ui/TextField";
import { router, useForm } from "@inertiajs/react";
import { useFormValidation } from "@react-aria/form";
import { useFormValidationState } from "@react-stately/form";
import { ChevronLeft, ChevronRight, Edit3, Trash, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DialogTrigger, FormContext, Group, TableBody, TagList, useSlottedContext } from "react-aria-components";
import { useListData } from "react-stately";
import { Pressable } from "react-aria-components";
import { SearchField } from "@/components/ui/SearchField";
import { getPages, getQueryParams, updateQueryParams } from "@/utils";
import { Link } from "@/components/ui/link";

export default function Role({ roles, permissions }) {
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));
    const [selectedItem, setSelectedItem] = useState(null);
    const [open, setOpen] = useState(false);

    return (
        <AppLayout>
            <div className="grid grid-cols-1 gap-6 w-full">
                <AppHead title="Roles" />
                <div className="flex gap-2 items-end">
                    <h1 className="text-xl font-bold col-span-full">Role</h1>
                    /
                    <Pressable onPress={() => (setSelectedItem(null), setOpen(true))}>
                        <span className="text-blue-500 underline cursor-pointer">Create Role</span>
                    </Pressable>
                </div>
                <Form onSubmit={(e) => {
                    e.preventDefault();
                    let url = updateQueryParams(null, 'search', e.target.search.value);
                    url = updateQueryParams(url, 'page', 1);
                    router.get(url.toString());
                }}>
                    <SearchField autoFocus className={'max-w-2xs'} defaultValue={getQueryParams('search')} placeholder="Search..." name="search" />
                </Form>
                <div className="overflow-auto">
                    <Table
                        className="w-full max-h-full"
                        aria-label="Roles"
                        width="100%"
                        selectionKeys={selectedKeys}
                        onSelectionChange={(keys) => {
                            if (keys == 'all') {
                                setSelectedKeys(new Set(roles.map((role) => role.id)))
                            } else {
                                setSelectedKeys(keys)
                            }
                        }}
                        sortDescriptor={{
                            column: getQueryParams('column'),
                            direction: getQueryParams('direction')
                        }} onSortChange={(props) => {
                            let url = updateQueryParams(null, 'column', props.column);
                            url = updateQueryParams(url, 'direction', props.direction);
                            router.get(url.toString());
                        }}
                    >
                        <TableHeader className="w-full h-8">
                            <Column id="name" width={100} isRowHeader allowsSorting>Role</Column>
                            <Column id="description" width={100} isRowHeader allowsSorting>Description</Column>
                            <Column width={'auto'}>Permissions</Column>
                            <Column width={100}>Action</Column>
                        </TableHeader>
                        <TableBody items={roles.data}>
                            {(role) => {
                                return (<Row style={{ verticalAlign: 'top' }} key={role.id.toString()}>
                                    <Cell>{role.name}</Cell>
                                    <Cell>{role.description}</Cell>
                                    <Cell>
                                        <TagGroup>
                                            {role.permissions.map((permission) => {
                                                return (<Tag key={permission.id}>{permission.name}</Tag>)
                                            })}
                                        </TagGroup>
                                    </Cell>
                                    <Cell>
                                        <div className="flex gap-1 justify-end">
                                            <Button variant="icon" className="flex w-min items-center " onPress={() => (setSelectedItem(role), setOpen(true))}>
                                                <Edit3 size={16} className="text-yellow-500" />
                                            </Button>
                                            <DialogTrigger>
                                                <Button variant="icon" className="flex w-min items-center ">
                                                    <Trash2 size={16} className="text-red-500" />
                                                </Button>
                                                <Modal>
                                                    <AlertDialog actionLabel="Delete" title="Delete Role" variant="destructive" className="p-6" onAction={() => router.delete(route('roles.delete', role.id))}>
                                                        Are you sure you want to delete this role?
                                                    </AlertDialog>
                                                </Modal>
                                            </DialogTrigger>
                                        </div>
                                    </Cell>
                                </Row>)
                            }}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex justify-center items-center gap-2">
                    <Link variant="secondary" className="data-[disabled=true]:opacity-50" isDisabled={!roles.prev_page_url} href={roles.prev_page_url && roles.prev_page_url}><ChevronLeft /></Link>
                    <span>
                        Page{" "}
                        <select className="border p-1" value={roles.current_page} onChange={(e) => router.get(updateQueryParams(null, 'page', e.target.value))}>
                            {getPages(roles.current_page, roles.last_page).map((page) => (
                                <option key={page} value={page}>{page}</option>
                            ))}
                        </select>{" "}
                        of {roles.last_page}
                    </span>
                    <Link variant="secondary" className="data-[disabled=true]:opacity-50" isDisabled={!roles.next_page_url} href={roles.next_page_url && roles.next_page_url}><ChevronRight /></Link>
                </div>
                <RoleForm open={open} setOpen={setOpen} key={selectedItem?.id} permissions={permissions} selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
            </div>
        </AppLayout>
    )
}

function RoleForm({ open, setOpen, permissions, selectedItem, setSelectedItem }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: selectedItem?.name || null,
        description: selectedItem?.description || null,
        permissions: selectedItem?.permissions?.map((permission) => permission.id) || []
    });


    const permissionOptions = permissions.map((permission) => {
        return ({ id: permission.id, name: permission.name })
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedItem?.id) {
            put(route('roles.update', selectedItem.id), {
                onSuccess: () => {
                    reset();
                    setSelectedItem(null);
                    setOpen(false);
                }
            });
        } else {
            post(route('roles.create'), {
                onSuccess: () => {
                    reset();
                    setSelectedItem(null);
                    setOpen(false);
                }
            });
        }
    }

    return (
        <Modal isOpen={open} onOpenChange={setOpen} isDismissable>
            <Form validationErrors={errors} onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
                <h2 className="text-lg font-semibold">{selectedItem?.id ? `Edit ${selectedItem.name} Role` : 'Add Role'}</h2>
                <div className="grid grid-cols-1 gap-2">
                    <input type="hidden" name="id" defaultValue={selectedItem?.id} />
                    <TextField name="name" type="text" defaultValue={selectedItem?.name} onChange={(value) => setData('name', value)} className="w-full" placeholder="Role" label={'Role'} />
                    <TextField name="description" type="text" defaultValue={selectedItem?.description} onChange={(value) => setData('description', value)} className="w-full" placeholder="Description" label={'Description'} />
                    <MultiComboBox
                        items={permissionOptions}
                        selectedItems={selectedItem?.permissions.map((permission) => ({
                            id: permission.id, name: permission.name
                        })) || []}
                        isRequired={true}
                        name="permissions"
                        placeholder="Select permissions"
                        label={'Permissions'}
                        onSelectionChange={(keys) => setData('permissions', keys.map((key) => key.id))}
                    />
                </div>
                <div className="flex gap-2 w-min ms-auto">
                    <Button variant="secondary" onPress={() => setOpen(false)} className="w-full">Cancel</Button>
                    <Button type="submit" className="w-full" isDisabled={processing}>Save</Button>
                </div>
            </Form>
        </Modal>
    );
}

function MultiComboBox({ items, selectedItems, isRequired = false, name = '', onSelectionChange, ...props }) {
    const selectRef = useRef();
    const formContext = useSlottedContext(FormContext) || {};
    const validationState = useFormValidationState({
        isRequired: isRequired,
        name: name,
        validationBehavior: formContext.validationBehavior,
        value: selectedItems
    });
    useFormValidation({
        validationBehavior: formContext.validationBehavior,
        focus: () => selectRef.current?.focus()
    }, validationState, selectRef);
    const list = useListData({
        initialItems: selectedItems,
    });
    const availableList = useListData({
        initialItems: items.filter((item) => !list.items.map((item) => item.id).includes(item.id)),
    });

    const handleOnSelectionChange = (key) => {
        if (!availableList.getItem(key)) {
            return;
        }
        list.append(availableList.getItem(key));
        availableList.remove(key);
        validationState.commitValidation();
    };

    const handleOnRemove = (keys) => {
        let key = keys.values().next().value;
        availableList.append(list.getItem(key));
        list.remove(key);
        validationState.commitValidation();
    };

    useEffect(() => {
        console.info(list.items);
        onSelectionChange(list.items);
    }, [list.items]);

    return (
        <Group>
            <select
                className="sr-only"
                multiple
                value={list.items.map((item) => item.id)}
                onChange={() => { }}
                required={isRequired}
                name={name}
                ref={selectRef}
            >
                {items.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.name}
                    </option>
                ))}
            </select>
            <ComboBox
                items={availableList.items}
                renderEmptyState={() => <p className="text-center p-2">No available permissions</p>}
                onSelectionChange={handleOnSelectionChange}
                selectedKey={null}
                allowsEmptyCollection
                isInvalid={validationState.displayValidation.isInvalid}
                errorMessage={validationState.displayValidation.validationErrors.join(', ')}
                {...props}
            >
                {(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
            </ComboBox>
            {list.items.length > 0 && <TagGroup onRemove={handleOnRemove}>
                <TagList items={list.items}>
                    {(item) => <Tag>{item.name}</Tag>}
                </TagList>
            </TagGroup>}
        </Group>
    );
}