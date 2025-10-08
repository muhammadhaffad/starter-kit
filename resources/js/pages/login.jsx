import { Form } from "@/components/ui/Form";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, usePage } from "@inertiajs/react";
import { toast } from "sonner";
import FlashMessages from "@/components/ui/flash-messages";
import RootWrapper from "@/components/layout/root-wrapper";

export default function Login() {
    const { app_logo, app_name } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    }
    return (
        <RootWrapper>
            <div className="flex flex-col items-center gap-6 h-screen justify-center">
                <div className="flex gap-x-2 items-center">
                    <div className="w-10 h-10 p-1 bg-white flex items-center justify-center rounded shrink-0">
                        <img src={app_logo} alt="" />
                    </div>
                    <label>
                        <p className="text-ellipsis overflow-hidden font-bold text-lg">{app_name}</p>
                    </label>
                </div>
                <Form validationErrors={errors} onSubmit={handleSubmit} className="items-center max-w-sm w-full border p-4 rounded-2xl">
                    <div className="self-start">
                        <h1 className="text-xl font-bold">Login to your account</h1>
                        <p className="text-sm text-primary/50">Enter your email below to login to your account</p>
                    </div>
                    <TextField autoFocus name="email" label="Email" type="email" className="w-full" isRequired value={data.email} onChange={(value) => setData('email', value)} placeholder="email@example.com" />
                    <TextField name="password" label="Password" type="password" className="w-full" isRequired value={data.password} onChange={(value) => setData('password', value)} placeholder="Password" />
                    <Checkbox name="remember" label="Remember me" className="self-start" value={data.remember} onChange={(value) => setData('remember', value)}>Remember me</Checkbox>
                    <Button type="submit" className="w-full" isDisabled={processing}>Login</Button>
                </Form>
            </div>
        </RootWrapper>
    )
}