import AppLayout from "@/components/layout/app-layout";
import { AlertDialog } from "@/components/ui/AlertDialog";
import { Button } from "@/components/ui/button";
import { ComboBox, ComboBoxItem } from "@/components/ui/ComboBox";
import { Form } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { Cell, Column, Row, Table, TableHeader } from "@/components/ui/table";
import { Tag, TagGroup } from "@/components/ui/TagGroup";
import { TextField } from "@/components/ui/text-field";
import { router, useForm } from "@inertiajs/react";
import { useFormValidation } from "@react-aria/form";
import { useFormValidationState } from "@react-stately/form";
import { Edit3, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DialogTrigger, FormContext, Group, TableBody, TagList, useSlottedContext } from "react-aria-components";
import { useListData } from "react-stately";

export default function Role({ roles, permissions }) {
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));
    const [selectedItem, setSelectedItem] = useState(null);
    const items = permissions.map((permission) => {
        return ({ id: permission.id, name: permission.name })
    });
    const selectedItems = [];

    const { data, setData, post, put, delete: deleteRole, processing, errors } = useForm({
        name: "",
        description: "",
        permissions: []
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedItem?.id) {
            put(route('roles.update', selectedItem.id), {
                onSuccess: () => {
                    e.target.reset();
                    setData({
                        name: "",
                        description: "",
                        permissions: []
                    });
                }
            });
        } else {
            post(route('roles.create'), {
                onSuccess: () => {
                    e.target.reset();
                    setData({
                        name: "",
                        description: "",
                        permissions: []
                    });
                }
            });
        }
    }


    useEffect(() => {
        if (selectedItem) {
            setData({
                name: selectedItem.name,
                description: selectedItem.description,
                permissions: selectedItem.permissions
            });
        }
    }, [selectedItem]);

    return (
        <AppLayout>
            <div className="flex flex-col gap-6 w-full">
                <h1 className="text-xl font-bold">Role</h1>
                <div className="overflow-auto">
                    <Table className="w-full" aria-label="Files" width="100%" selectionKeys={selectedKeys} onSelectionChange={(keys) => {
                        if (keys == 'all') {
                            setSelectedKeys(new Set(roles.map((role) => role.id)))
                        } else {
                            setSelectedKeys(keys)
                        }
                    }}>
                        <TableHeader className="w-full h-8">
                            <Column width={100} isRowHeader>Name</Column>
                            <Column width={'auto'}>Permissions</Column>
                            <Column width={100}>Action</Column>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => {
                                return (<Row style={{ verticalAlign: 'top' }} id={role.id.toString()}>
                                    <Cell>{role.name}</Cell>
                                    <Cell>
                                        <TagGroup>
                                            {role.permissions.map((permission) => {
                                                return (<Tag key={permission.id}>{permission.name}</Tag>)
                                            })}
                                        </TagGroup>
                                    </Cell>
                                    <Cell>
                                        <div className="flex gap-1">
                                            <Button className="flex w-min items-center gap-2 p-2 ms-auto" onPress={() => setSelectedItem(role)}>
                                                <Edit3 size={16} />
                                            </Button>
                                            <DialogTrigger>
                                                <Button variant="destructive" className="flex w-min items-center gap-2 p-2 ms-auto">
                                                    <Trash size={16} />
                                                </Button>
                                                <Modal>
                                                    <AlertDialog actionLabel="Delete" title="Delete Role" variant="destructive" className="p-6" onAction={() => deleteRole(router.delete(route('roles.delete', role.id)))}>
                                                        <p>Are you sure you want to delete this role?</p>
                                                    </AlertDialog>
                                                </Modal>
                                            </DialogTrigger>
                                        </div>
                                    </Cell>
                                </Row>)
                            })}
                        </TableBody>
                    </Table>
                </div>
                <div className="max-w-sm">
                    <Form key={selectedItem?.id} validationErrors={errors} onSubmit={handleSubmit} >
                        <div className="grid grid-cols-1 gap-2">
                            <input type="hidden" name="id" defaultValue={selectedItem?.id} />
                            <TextField name="name" type="text" defaultValue={selectedItem?.name} onChange={(value) => setData('name', value)} className="w-full" placeholder="Role" label={'Role'} />
                            <TextField name="description" type="text" defaultValue={selectedItem?.description} onChange={(value) => setData('description', value)} className="w-full" placeholder="Description" label={'Description'} />
                            <MultiComboBox
                                items={items}
                                selectedItems={selectedItem?.permissions.map((permission) => ({
                                    id: permission.id, name: permission.name
                                }))}
                                isRequired={true}
                                name="permissions"
                                placeholder="Select permissions"
                                label={'Permissions'}
                                onSelectionChange={(keys) => setData('permissions', keys.map((key) => key.id))}
                            />
                            <Button type="submit" className="w-full">Submit</Button>
                        </div>
                    </Form>
                </div>
            </div>
        </AppLayout>
    )
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
        initialItems: items.filter((item) => !list.items.includes(item.id)),
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
                    {(item) => <Tag id={item.id}>{item.name}</Tag>}
                </TagList>
            </TagGroup>}
        </Group>
    );
}