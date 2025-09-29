import AppLayout from "@/components/layout/app-layout";
import { AlertDialog } from "@/components/ui/AlertDialog";
import { Button } from "@/components/ui/button";
import { ComboBox, ComboBoxItem } from "@/components/ui/ComboBox";
import { Modal } from "@/components/ui/modal";
import { Cell, Column, Row, Table, TableHeader } from "@/components/ui/table";
import { Tag, TagGroup } from "@/components/ui/TagGroup";
import { Edit3, Trash } from "lucide-react";
import { useState } from "react";
import { DialogTrigger, Group, TableBody, TagList } from "react-aria-components";

export default function Role({ roles }) {
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));
    const [selectedItem, setSelectedItem] = useState(null);
    let list = [];
    let availableList = [
        { id: 1, name: 'News' },
        { id: 2, name: 'Travel' },
        { id: 3, name: 'Gaming' },
        { id: 4, name: 'Shopping' },
    ];

    return (
        <AppLayout>
            <div className="flex flex-col gap-6 w-full">
                <h1 className="text-xl font-bold">Role</h1>
                <div className="overflow-auto">
                    <Table className="w-full" aria-label="Files" width="100%" selectionMode="multiple" selectionKeys={selectedKeys} onSelectionChange={(keys) => {
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
                                                <Button variant="destructive" className="flex w-min items-center gap-2 p-2 ms-auto" onPress={() => setSelectedItem(role)}>
                                                    <Trash size={16} />
                                                </Button>
                                                <Modal>
                                                    <AlertDialog actionLabel="Delete" title="Delete Role" variant="destructive" className="p-6">
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
                <div className="">
                    <Group>
                        <TagGroup onRemove={() => { }}>
                            <TagList items={list.items}>
                                {(item) => <Tag>{item.name}</Tag>}
                            </TagList>
                        </TagGroup>
                        <ComboBox onSelectionChange={(key) => {
                            
                            const selectedList = new Set([...list.map((item) => item.id), key]);
                            console.info(selectedList);
                        }}>
                            {availableList.map((item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>)}
                        </ComboBox>
                        {/* <ComboBox
                            items={availableList.items}
                            selectedKey={fieldState.selectedKey}
                            inputValue={fieldState.inputValue}
                            onSelectionChange={onSelectionChange}
                            onInputChange={onInputChange}
                        >
                            <div>
                                <Input
                                    onKeyDownCapture={(e) => {
                                        console.log(e.key);
                                        if (e.key === 'Backspace' && fieldState.inputValue === '') {
                                            deleteLast();
                                        }
                                    }}
                                />
                                <Button>▼</Button>
                            </div>
                            <Popover>
                                <ListBox>{(item) => <ListBoxItem>{item.name}</ListBoxItem>}</ListBox>
                            </Popover>
                        </ComboBox> */}
                    </Group>
                </div>
            </div>
        </AppLayout>
    )
}