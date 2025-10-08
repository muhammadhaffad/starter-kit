import AppLayout from "@/components/layout/app-layout";
import { Form } from "@/components/ui/Form";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/button";
import { useForm, usePage } from "@inertiajs/react";
import { Dialog } from "@/components/ui/Dialog";
import { Modal } from "@/components/ui/modal";
import { DialogTrigger, FileTrigger, Group, Heading, Pressable } from "react-aria-components";
import AppHead from "@/components/layout/app-head";
import { Label } from "@/components/ui/Field";
import { ImageUp, Loader2, Paperclip } from "lucide-react";
import { useEffect, useState } from "react";

export default function Settings() {
    const { user } = usePage().props;
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <AppHead title="Account Settings" />
                <h1 className="text-xl font-bold">Settings</h1>
                <ProfileForm user={user} />
                <ChangePasswordForm />
                <DangerAreaForm />
            </div>
        </AppLayout>
    )
}

function ProfileForm({ user }) {
    const { data, setData, post, processing, errors } = useForm({
        email: user?.email,
        name: user?.name,
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('account-settings.update-profile'));
    }
    return (
        <Form validationErrors={errors} onSubmit={handleSubmit} className="items-center max-w-lg w-full rounded-2xl">
            <div className="self-start">
                <h2 className="text-lg font-semibold">Profile Information</h2>
                <p className="text-sm text-primary
                /50">Manage your personal information.</p>
            </div>
            <Group className={"flex flex-col gap-1 self-start"}>
                <Label>Profile Picture</Label>
                <UploadProfilePicture user={user} />
            </Group>
            <TextField name="email" label="Email" type="email" className="w-full" isRequired value={data.email} onChange={(value) => setData('email', value)} placeholder="email@example.com" />
            <TextField name="name" label="Name" type="text" className="w-full" isRequired value={data.name} onChange={(value) => setData('name', value)} placeholder="Name" />
            <Button type="submit" className="self-start" isDisabled={processing}>Save</Button>
        </Form>
    );
}

function UploadProfilePicture({ user }) {
    const [preview, setPreview] = useState(user?.avatar ? `${window.Laravel.asset_url}/${user?.avatar}` : "/yoji-noda.jpg");

    const { data, setData, post, processing, progress, errors, reset } = useForm({
        avatar: null,
    });

    // ... other component code ...

    const handleFileChange = (e) => {
        const file = Array.from(e)[0];  // Use e.target.files if e is the event; adjust if e is FileList directly
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => setPreview(event.target.result);
        reader.readAsDataURL(file);

        setData('avatar', file);  // Just update the data here
    };

    useEffect(() => {
        if (data.avatar && !processing) {  // Check for file and not already posting
            post(route('account-settings.upload-profile-picture'), {
                forceFormData: true,
                preserveScroll: true,  // If you want this; wasn't in your original but common
                onSuccess: () => {
                    reset();  // Resets avatar to null after success
                },
                // Optional: onError or other callbacks if needed
            });
        }
    }, [data.avatar]);  // Depend on data.avatar to trigger on changes

    return (
        <>
            <Group className={"flex gap-2 items-center"}>
                <img
                    alt=""
                    src={preview}
                    className="w-12 h-12 rounded-full"
                />
                <FileTrigger
                    acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
                    onSelect={handleFileChange}
                >
                    <Pressable>
                        <span className={'flex gap-1 items-center cursor-pointer'}>
                            {progress ? <Loader2 className="animate-spin aspect-square size-5" /> : <ImageUp size={16} />}
                            Upload Image
                        </span>
                    </Pressable>
                </FileTrigger>
            </Group>
            <span class="text-sm text-red-600 forced-colors:text-[Mark]" slot="errorMessage">{errors.avatar}</span>
        </>
    );
}

function ChangePasswordForm() {
    const { data, setData, post, processing, errors } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('account-settings.change-password'), {
            onSuccess: () => {
                e.target.reset();
            }
        });
    }
    return (
        <Form validationErrors={errors} onSubmit={handleSubmit} className="items-center max-w-lg w-full rounded-2xl">
            <div className="self-start">
                <h2 className="text-lg font-semibold">Change Password</h2>
                <p className="text-sm text-primary/50">Update your current password to keep your account secure.</p>
            </div>
            <TextField name="current_password" label="Current Password" type="password" className="w-full" isRequired value={data.current_password} onChange={(value) => setData('current_password', value)} placeholder="Current Password" />
            <TextField name="password" min="8" label="New Password" type="password" className="w-full" isRequired value={data.password} onChange={(value) => setData('password', value)} placeholder="New Password" />
            <TextField name="password_confirmation" min="8" label="Confirm New Password" type="password" className="w-full" isRequired value={data.password_confirmation} onChange={(value) => setData('password_confirmation', value)} placeholder="Confirm New Password" />
            <Button type="submit" className="self-start" isDisabled={processing}>Change Password</Button>
        </Form>
    );
}

function DangerAreaForm() {
    const { data, setData, post, processing, errors } = useForm({
        current_password: "",
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('account-settings.deactivate'));
    }
    return (
        <div className="flex flex-col gap-4 items-center max-w-lg w-full rounded-2xl">
            <div className="self-start">
                <h2 className="text-lg font-semibold">Danger Area</h2>
                <p className="text-sm text-primary/50">Deactivate your account.</p>
            </div>
            <DialogTrigger>
                <Button variant="destructive" className="self-start">Deactivate Account</Button>
                <Modal isDismissable>
                    <Dialog className={"p-4"}>
                        <Heading slot="title" className="text-lg font-semibold">Confirmation Deactivate Account</Heading>
                        <Form validationErrors={errors} onSubmit={handleSubmit} className="items-center">
                            <div className="self-start">
                                <p className="text-sm text-primary/50">Please enter your password to confirm you would like to deactivate your account.</p>
                            </div>
                            <TextField name="current_password" label="Current Password" type="password" className="w-full" isRequired value={data.current_password} onChange={(value) => setData('current_password', value)} placeholder="Current Password" />
                            <Button type="submit" className="self-end" variant="destructive" isDisabled={processing}>Deactivate Account</Button>
                        </Form>
                    </Dialog>
                </Modal>
            </DialogTrigger>
        </div>
    );
}