import AppLayout from "@/components/layout/app-layout";
import { AlertDialog } from "@/components/ui/AlertDialog";
import { Button } from "@/components/ui/button";
import { ComboBox, ComboBoxItem } from "@/components/ui/ComboBox";
import { Form } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { Tag, TagGroup } from "@/components/ui/TagGroup";
import { TextField } from "@/components/ui/text-field";
import { router, useForm } from "@inertiajs/react";
import { useFormValidation } from "@react-aria/form";
import { useFormValidationState } from "@react-stately/form";
import { useEffect, useRef } from "react";
import { DialogTrigger, FormContext, Group, TagList, useSlottedContext } from "react-aria-components";
import { useListData } from "react-stately";

export default function UserDetail({ user, roles }) {
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <h1 className="text-xl font-bold">User Detail</h1>
                <ProfileForm user={user} />
                <ChangePasswordForm user={user} />
                <ChangeRoleForm user={user} roles={roles} />
                <DangerAreaForm user={user} />
            </div>
        </AppLayout>
    );
}

function ProfileForm({ user }) {
    const { data, setData, put, processing, errors } = useForm({
        email: user?.email,
        name: user?.name,
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('users.detail.update-profile', user.id));
    }
    return (
        <Form validationErrors={errors} onSubmit={handleSubmit} className="items-center max-w-sm w-full rounded-2xl">
            <div className="self-start">
                <h2 className="text-lg font-semibold">Profile Information</h2>
                <p className="text-sm text-primary/50">Manage user personal information.</p>
            </div>
            <TextField name="email" label="Email" type="email" className="w-full" isRequired value={data.email} onChange={(value) => setData('email', value)} placeholder="email@example.com" />
            <TextField name="name" label="Name" type="text" className="w-full" isRequired value={data.name} onChange={(value) => setData('name', value)} placeholder="Name" />
            <Button type="submit" className="self-start" isDisabled={processing}>Save</Button>
        </Form>
    );
}

function ChangePasswordForm({ user }) {
    const { data, setData, put, processing, errors } = useForm({
        password: "",
        password_confirmation: "",
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('users.detail.change-password', user.id), {
            onSuccess: () => {
                e.target.reset();
            }
        });
    }
    return (
        <Form validationErrors={errors} onSubmit={handleSubmit} className="items-center max-w-sm w-full rounded-2xl">
            <div className="self-start">
                <h2 className="text-lg font-semibold">Change Password</h2>
                <p className="text-sm text-primary/50">Update user password to keep user account secure.</p>
            </div>
            <TextField name="password" min="8" label="New Password" type="password" className="w-full" isRequired value={data.password} onChange={(value) => setData('password', value)} placeholder="New Password" />
            <TextField name="password_confirmation" min="8" label="Confirm New Password" type="password" className="w-full" isRequired value={data.password_confirmation} onChange={(value) => setData('password_confirmation', value)} placeholder="Confirm New Password" />
            <Button type="submit" className="self-start" isDisabled={processing}>Change Password</Button>
        </Form>
    );
}

function ChangeRoleForm({ user, roles }) {
    const { data, setData, put, processing, errors } = useForm({
        role: user.roles.map((role) => role.id),
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('users.detail.change-role', user.id));
    }
    return (
        <Form validationErrors={errors} onSubmit={handleSubmit} className="items-center max-w-sm w-full rounded-2xl">
            <div className="flex flex-col gap-4 items-start max-w-sm w-full">
                <div className="self-start">
                    <h2 className="text-lg font-semibold">Change Role</h2>
                    <p className="text-sm text-primary/50">Change user role to manage user permissions.</p>
                </div>
                <MultiComboBox
                    placeholder="Select role"
                    className="w-full"
                    name="role"
                    items={roles.map((role) => ({ id: role.id, name: role.name }))}
                    selectedItems={user.roles.map((role) => ({ id: role.id, name: role.name }))} onSelectionChange={(keys) => setData('role', keys.map((key) => key.id))}
                />
                <Button type="submit" isDisabled={processing} className="self-start">Change Role</Button>
            </div>
        </Form>
    );
}

function DangerAreaForm({ user }) {
    return (
        <div className="flex flex-col gap-4 items-center max-w-sm w-full rounded-2xl">
            <div className="self-start">
                <h2 className="text-lg font-semibold">Danger Area</h2>
                <p className="text-sm text-primary/50">{user.deleted_at ? 'Reactivate' : 'Deactivate'} your account.</p>
            </div>
            <DialogTrigger>
                <Button variant={user.deleted_at ? 'primary' : 'destructive'} className="self-start">{user.deleted_at ? 'Reactivate' : 'Deactivate'} Account</Button>
                <Modal>
                    <AlertDialog onAction={() => {
                        if (user.deleted_at) {
                            router.put(route('users.detail.reactivate', user.id));
                        } else {
                            router.put(route('users.detail.deactivate', user.id));
                        }
                    }} actionLabel={user.deleted_at ? 'Reactivate' : 'Deactivate'} title={`${user.deleted_at ? 'Reactivate' : 'Deactivate'} Account`} variant={user.deleted_at ? 'default' : 'destructive'} className="p-6">
                        Are you sure you want to {user.deleted_at ? 'reactivate' : 'deactivate'} this account?
                    </AlertDialog>
                </Modal>
            </DialogTrigger>
        </div>
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
        <Group className={'w-full'}>
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