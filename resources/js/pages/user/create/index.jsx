import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { ComboBox, ComboBoxItem } from "@/components/ui/ComboBox";
import { Form } from "@/components/ui/form";
import { Tag, TagGroup } from "@/components/ui/TagGroup";
import { TextField } from "@/components/ui/text-field";
import { useForm } from "@inertiajs/react";
import { useFormValidation } from "@react-aria/form";
import { useFormValidationState } from "@react-stately/form";
import { useEffect, useRef } from "react";
import { FormContext, Group, TagList, useSlottedContext } from "react-aria-components";
import { useListData } from "react-stately";

export default function UserCreate({ roles }) {
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="">
                    <h1 className="text-xl font-bold">Create User</h1>
                    <p className="text-sm text-primary/50">Create user account.</p>
                </div>
                <ProfileForm roles={roles} />
            </div>
        </AppLayout>
    );
}

function ProfileForm({ roles }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        name: '',
        password: '',
        password_confirmation: '',
        role: [],
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('users.store'));
    }
    return (
        <Form validationErrors={errors} onSubmit={handleSubmit} className="items-center max-w-sm w-full rounded-2xl">
            <TextField name="email" label="Email" type="email" className="w-full" isRequired value={data.email} onChange={(value) => setData('email', value)} placeholder="email@example.com" />
            <TextField name="name" label="Name" type="text" className="w-full" isRequired value={data.name} onChange={(value) => setData('name', value)} placeholder="Name" />
            <TextField name="password" label="Password" type="password" className="w-full" isRequired value={data.password} onChange={(value) => setData('password', value)} placeholder="Password" />
            <TextField name="password_confirmation" label="Confirm Password" type="password" className="w-full" isRequired value={data.password_confirmation} onChange={(value) => setData('password_confirmation', value)} placeholder="Confirm Password" />
            <MultiComboBox name="role" items={roles} selectedItems={data.role} onSelectionChange={(value) => setData('role', value.map((item) => item.id))} placeholder="Select Roles" label="Roles" isRequired />
            <Button type="submit" className="self-start" isDisabled={processing}>Create</Button>
        </Form>
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