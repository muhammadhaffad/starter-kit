import { Button } from "@/components/ui/button";
import { Cell, Column, Row, Table, TableHeader } from "@/components/ui/table";
import { Tag, TagGroup } from "@/components/ui/TagGroup";
import { ChevronLeft, ChevronRight, Edit3, Trash } from "lucide-react";
import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { TableBody } from "react-aria-components";
import { Link } from "@/components/ui/link";
import { Switch } from "@/components/ui/Switch";
import { router, useForm } from "@inertiajs/react";
import { SearchField } from "@/components/ui/SearchField";
import { Form } from "@/components/ui/form";

export default function User({ users }) {
    const { data, setData, get } = useForm({
        search: getQueryParams('search')
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('users.index'));
    };
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex gap-2 items-baseline">
                    <h1 className="text-xl font-bold">Users</h1>
                    /
                    <Link href={route('users.create')} className="text-primary hover:underline">Create User</Link>
                </div>
                <Form onSubmit={handleSearch}>
                    <SearchField className={'max-w-2xs'} defaultValue={data.search} onChange={(value) => setData('search', value)} placeholder="Search..." name="search" />
                </Form>
                <div className="overflow-auto">
                    <Table className="w-full" aria-label="Files" width="100%">
                        <TableHeader className="w-full h-8">
                            <Column width={200} isRowHeader>Name</Column>
                            <Column width={200} isRowHeader>Email</Column>
                            <Column width={'auto'} isRowHeader>Role</Column>
                            <Column width={100} isRowHeader>Is Active?</Column>
                        </TableHeader>
                        <TableBody>
                            {users.data.map((user) => {
                                return (<Row href={route('users.detail', user.id)} style={{ verticalAlign: 'top', cursor: 'pointer' }} key={user.id.toString()}>
                                    <Cell>{user.name}</Cell>
                                    <Cell>{user.email}</Cell>
                                    <Cell>
                                        <TagGroup>
                                            {user.roles.map((role) => <Tag key={role.id}>{role.name}</Tag>)}
                                        </TagGroup>
                                    </Cell>
                                    <Cell>
                                        <Switch isSelected={!user.deleted_at} onChange={(value) => {
                                            if (value) {
                                                router.put(route('users.detail.reactivate', user.id));
                                            } else {
                                                router.put(route('users.detail.deactivate', user.id));
                                            }
                                        }} />
                                    </Cell>
                                </Row>)
                            })}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex justify-center items-center gap-2">
                    <Link variant="secondary" className="data-[disabled=true]:opacity-50" isDisabled={!users.prev_page_url} href={users.prev_page_url && users.prev_page_url}><ChevronLeft /></Link>
                    <span>
                        Page{" "}
                        <select className="border p-1" value={users.current_page} onChange={(e) => router.get(updateQueryParams(null, 'page', e.target.value))}>
                            {getPages(users.current_page, users.last_page).map((page) => (
                                <option key={page} value={page}>{page}</option>
                            ))}
                        </select>{" "}
                        of {users.last_page}
                    </span>
                    <Link variant="secondary" className="data-[disabled=true]:opacity-50" isDisabled={!users.next_page_url} href={users.next_page_url && users.next_page_url}><ChevronRight /></Link>
                </div>
            </div>
        </AppLayout>
    )
}

function getPages(curr_page, last_page) {
    const start = Math.max(curr_page - 3, 1);
    const end = Math.min(curr_page + 3, last_page);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function updateQueryParams(uri, key, value) {
    const url = new URL(uri || window.location.href);
    if (url.searchParams.has(key)) {
        url.searchParams.set(key, value);
    } else {
        url.searchParams.append(key, value);
    }
    return url.toString();
}

function getQueryParams(key) {
    const url = new URL(window.location.href);
    return url.searchParams.get(key);
}