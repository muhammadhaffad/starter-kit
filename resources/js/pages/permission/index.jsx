import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Cell, Column, Row, Table, TableHeader } from "@/components/ui/table";
import { TextField } from "@/components/ui/text-field";
import { Edit3, Plus, Trash } from "lucide-react";
import { DialogTrigger, ResizableTableContainer, TableBody } from "react-aria-components";
import { useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { AlertDialog } from "@/components/ui/AlertDialog";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/field";

export default function Permission({ permissions }) {
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));
    const [selectedItem, setSelectedItem] = useState(null);
    const { data, setData, post, put, delete: deletePermission, processing, errors } = useForm({
        name: "",
        description: ""
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedItem?.id) {
            put(route('permissions.update', selectedItem.id), {
                onSuccess: () => {
                    e.target.reset();
                    setSelectedItem(null);
                }
            });
        } else {
            post(route('permissions.create'), {
                onSuccess: () => {
                    e.target.reset();
                    setSelectedItem(null);
                }
            });
        }
    }

    useEffect(() => {
        if (selectedItem) {
            setData({
                name: selectedItem.name,
                description: selectedItem.description
            });
        }
    }, [selectedItem]);

    return (
        <AppLayout>
            <div className="flex flex-col gap-6 max-w-xl">
                <div className="flex justify-between">
                    <h1 className="text-xl font-bold">Permission</h1>
                    {selectedKeys.size > 0 && (
                        <DialogTrigger>
                            <Button variant="destructive" className="flex w-min items-center gap-2 p-2 ms-auto">
                                <Trash size={16} />
                                Delete
                            </Button>
                            <Modal>
                                <AlertDialog onAction={() => deletePermission(route('permissions.delete', [...selectedKeys].join(',')), {
                                    onSuccess: () => {
                                        setSelectedKeys(new Set([]));
                                        setSelectedItem(null);
                                    }
                                })} actionLabel="Delete" title="Delete Permission" variant="destructive" className="p-6">
                                    <p>Are you sure you want to delete selected permission?</p>
                                </AlertDialog>
                            </Modal>
                        </DialogTrigger>
                    )}
                </div>
                <div className="overflow-auto">
                    <Table className="w-full" aria-label="Files" width="100%" selectionMode="multiple" selectionKeys={selectedKeys} onSelectionChange={(keys) => {
                        if (keys == 'all') {
                            setSelectedKeys(new Set(permissions.map((permission) => permission.id)))
                        } else {
                            setSelectedKeys(keys)
                        }
                    }}>
                        <TableHeader className="w-full h-8">
                            <Column width={'auto'} isRowHeader>Name</Column>
                            <Column width={'auto'}>Description</Column>
                            <Column width={100}>Action</Column>
                        </TableHeader>
                        <TableBody>
                            {permissions.map((permission) => {
                                return (<Row id={permission.id.toString()}>
                                    <Cell>{permission.name}</Cell>
                                    <Cell>{permission.description}</Cell>
                                    <Cell>
                                        <div className="flex gap-1">
                                            <Button className="flex w-min items-center gap-2 p-2 ms-auto" onPress={() => setSelectedItem(permission)}>
                                                <Edit3 size={16} />
                                            </Button>
                                            <DialogTrigger>
                                                <Button variant="destructive" className="flex w-min items-center gap-2 p-2 ms-auto" onPress={() => setSelectedItem(permission)}>
                                                    <Trash size={16} />
                                                </Button>
                                                <Modal>
                                                    <AlertDialog onAction={() => deletePermission(route('permissions.delete', selectedItem.id), {
                                                        onSuccess: () => {
                                                            setSelectedItem(null);
                                                            setSelectedKeys(new Set([]));
                                                        }
                                                    })} actionLabel="Delete" title="Delete Permission" variant="destructive" className="p-6">
                                                        <p>Are you sure you want to delete this permission?</p>
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
                <Form validationErrors={errors} onSubmit={handleSubmit} className="grid grid-cols-1 w-full justify-end gap-4 p-4 border rounded-lg">
                    <h2 className="text-lg font-semibold">{selectedItem?.id ? `Edit ${selectedItem.name} Permission` : 'Add Permission'}</h2>
                    <Input hidden name="id" value={selectedItem?.id} />
                    <TextField value={data.name} label={'Permission'} onChange={(value) => setData('name', value)} name="name" placeholder="Name permission" isRequired />
                    <TextField value={data.description} label={'Description'} onChange={(value) => setData('description', value)} name="description" placeholder="Description permission" isRequired />
                    {
                        <div className="flex gap-2 w-min ms-auto">
                            <Button variant="secondary" onPress={() => {
                                setData({
                                    name: "",
                                    description: ""
                                });
                                setSelectedItem(null);
                            }} className="flex w-min items-center gap-2 ms-auto">
                                Reset
                            </Button>
                            <Button isDisabled={processing} type="submit" className="flex w-min items-center gap-2 ms-auto">
                                Save
                            </Button>
                        </div>
                    }
                </Form>
            </div>
        </AppLayout>
    )
}