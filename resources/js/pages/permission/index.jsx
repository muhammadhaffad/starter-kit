import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/Button";
import { Form } from "@/components/ui/Form";
import { Cell, Column, Row, Table, TableHeader } from "@/components/ui/Table";
import { TextField } from "@/components/ui/TextField";
import { ChevronLeft, ChevronRight, Edit3, Trash, Trash2 } from "lucide-react";
import { DialogTrigger, Heading, Pressable, ResizableTableContainer, TableBody } from "react-aria-components";
import { router, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { AlertDialog } from "@/components/ui/AlertDialog";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Field";
import AppHead from "@/components/layout/app-head";
import { Dialog } from "@/components/ui/Dialog";
import { getPages, getQueryParams, updateQueryParams } from "@/utils";
import { SearchField } from "@/components/ui/SearchField";
import { Link } from "@/components/ui/Link";

export default function Permission({ permissions }) {
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));
    const [selectedItem, setSelectedItem] = useState(null);
    const [open, setOpen] = useState(false);

    return (
        <AppLayout>
            <div className="grid grid-cols-1 gap-6">
                <AppHead title="Permissions" />
                <div className="col-span-full flex justify-between">
                    <div className="flex gap-2 items-end">
                        <h1 className="text-xl font-bold">Permission</h1>
                        /
                        <Pressable onPress={() => (setSelectedItem(null), setOpen(true))}>
                            <span className="text-blue-500 underline cursor-pointer">Create Permission</span>
                        </Pressable>
                    </div>
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
                        className="w-full max-h-screen"
                        aria-label="Permissions"
                        width="100%"
                        selectionMode="multiple"
                        selectionKeys={selectedKeys} onSelectionChange={(keys) => {
                            if (keys == 'all') {
                                setSelectedKeys(new Set(permissions.map((permission) => permission.id)))
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
                            <Column id="name" width={'auto'} isRowHeader allowsSorting>Name</Column>
                            <Column id="description" width={'auto'} allowsSorting>Description</Column>
                            <Column width={100}>Action</Column>
                        </TableHeader>
                        <TableBody items={permissions.data}>
                            {(permission) => {
                                return (<Row>
                                    <Cell>{permission.name}</Cell>
                                    <Cell>{permission.description}</Cell>
                                    <Cell>
                                        <div className="flex gap-1 justify-end">
                                            <Button aria-label="Edit" variant="icon" className="flex w-min items-center" onPress={() => (setOpen(true), setSelectedItem(permission))}>
                                                <Edit3 size={16} className="text-yellow-500" />
                                            </Button>
                                            <DialogTrigger>
                                                <Button aria-label="Delete" variant="icon" className="flex w-min items-center" onPress={() => (setSelectedItem(permission))}>
                                                    <Trash2 size={16} className="text-red-500" />
                                                </Button>
                                                <Modal>
                                                    <AlertDialog onAction={() => router.delete(route('permissions.delete', selectedItem.id), {
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
                            }}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex justify-center items-center gap-2">
                    <Link variant="secondary" className="data-[disabled=true]:opacity-50" isDisabled={!permissions.prev_page_url} href={permissions.prev_page_url && permissions.prev_page_url}><ChevronLeft /></Link>
                    <span>
                        Page{" "}
                        <select className="border p-1" value={permissions.current_page} onChange={(e) => router.get(updateQueryParams(null, 'page', e.target.value))}>
                            {getPages(permissions.current_page, permissions.last_page).map((page) => (
                                <option key={page} value={page}>{page}</option>
                            ))}
                        </select>{" "}
                        of {permissions.last_page}
                    </span>
                    <Link variant="secondary" className="data-[disabled=true]:opacity-50" isDisabled={!permissions.next_page_url} href={permissions.next_page_url && permissions.next_page_url}><ChevronRight /></Link>
                </div>
                <PermissionForm key={selectedItem?.id} open={open} setOpen={setOpen} selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
            </div>
        </AppLayout>
    )
}

function PermissionForm({ open, setOpen, selectedItem, setSelectedItem }) {
    console.info(selectedItem);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: selectedItem?.name || "",
        description: selectedItem?.description || ""
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedItem?.id) {
            put(route('permissions.update', selectedItem.id), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                    setSelectedItem(null);
                }
            });
        } else {
            post(route('permissions.create'), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                    setSelectedItem(null);
                }
            });
        }
    }
    return (
        <Modal isOpen={open} onOpenChange={setOpen} isDismissable>
            <Form key={selectedItem?.id} validationErrors={errors} onSubmit={handleSubmit} className="grid grid-cols-1 w-full justify-end gap-4 p-4">
                <h2 className="text-lg font-semibold">{selectedItem?.id ? `Edit ${selectedItem.name} Permission` : 'Add Permission'}</h2>
                <input hidden name="id" value={selectedItem?.id} onChange={() => { }} />
                <TextField autoFocus value={data.name} label={'Permission'} onChange={(value) => setData('name', value)} name="name" placeholder="Name permission" isRequired />
                <TextField value={data.description} label={'Description'} onChange={(value) => setData('description', value)} name="description" placeholder="Description permission" isRequired />
                {
                    <div className="flex justify-between">
                        <Button variant="icon" onPress={() => {
                            reset();
                            setSelectedItem(null);
                        }} className="flex w-min items-center gap-2 text-nowrap px-3">
                            Create New
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="secondary" isDisabled={processing} onPress={() => {
                                setOpen(false);
                            }} className="flex w-min items-center gap-2">
                                Cancel
                            </Button>
                            <Button isDisabled={processing} type="submit" className="flex w-min items-center gap-2">
                                Save
                            </Button>
                        </div>
                    </div>
                }
            </Form>
        </Modal>
    );
}