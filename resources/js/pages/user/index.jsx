import { Cell, Column, Row, Table, TableHeader } from "@/components/ui/table";
import { Tag, TagGroup } from "@/components/ui/TagGroup";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AppLayout from "@/components/layout/app-layout";
import { TableBody } from "react-aria-components";
import { Link } from "@/components/ui/link";
import { Switch } from "@/components/ui/Switch";
import { router } from "@inertiajs/react";
import { SearchField } from "@/components/ui/SearchField";
import { Form } from "@/components/ui/form";
import AppHead from "@/components/layout/app-head";
import { getPages, getQueryParams, updateQueryParams } from "@/utils";

export default function User({ users }) {
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <AppHead title="Users" />
                <div className="flex gap-2 items-baseline">
                    <h1 className="text-xl font-bold">Users</h1>
                    /
                    <Link href={route('users.create')} className="text-primary hover:underline">Create User</Link>
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
                    <Table className="w-full" aria-label="Users" width="100%"
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
                            <Column id="name" width={200} isRowHeader allowsSorting>Name</Column>
                            <Column id="email" width={200} isRowHeader allowsSorting>Email</Column>
                            <Column id="role" width={'auto'} isRowHeader>Role</Column>
                            <Column id="is_active" width={100} isRowHeader>Is Active?</Column>
                        </TableHeader>
                        <TableBody items={users.data}>
                            {(user) => {
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
                            }}
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