import { Button } from "@/components/ui/button";
import { Cell, Column, Row, Table, TableHeader } from "@/components/ui/table";
import { Tag, TagGroup } from "@/components/ui/TagGroup";
import { Edit3, Trash } from "lucide-react";
import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { TableBody } from "react-aria-components";

export default function User({ users }) {
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <h1 className="text-xl font-bold">Users</h1>
                <div className="overflow-auto">
                    <Table className="w-full" aria-label="Files" width="100%">
                        <TableHeader className="w-full h-8">
                            <Column width={200} isRowHeader>Name</Column>
                            <Column width={200} isRowHeader>Email</Column>
                            <Column width={'auto'} isRowHeader>Role</Column>
                            <Column width={100} isRowHeader>Actions</Column>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => {
                                return (<Row href={route('users.detail', user.id)} style={{ verticalAlign: 'top' }} key={user.id.toString()}>
                                    <Cell>{user.name}</Cell>
                                    <Cell>{user.email}</Cell>
                                    <Cell>
                                        <TagGroup>
                                            {user.roles.map((role) => <Tag key={role.id}>{role.name}</Tag>)}
                                        </TagGroup>
                                    </Cell>
                                    <Cell>
                                        <div className="flex gap-1">
                                            <Button className="flex w-min items-center gap-2 p-2 ms-auto">
                                                <Edit3 size={16} />
                                            </Button>
                                            <Button variant="destructive" className="flex w-min items-center gap-2 p-2 ms-auto">
                                                <Trash size={16} />
                                            </Button>
                                        </div>
                                    </Cell>
                                </Row>)
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    )
}