import { Form } from "@/components/ui/Form";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/button";
import { useForm, usePage } from "@inertiajs/react";
import RootWrapper from "@/components/layout/root-wrapper";
import { Link } from "@/components/ui/Link";

export default function ForgotPassword() {
    const { app_logo, app_name } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('password.forgot.auth'));
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
                        <h1 className="text-xl font-bold">Forgot Password</h1>
                        <p className="text-sm text-primary/50">Enter your email below to reset your password</p>
                    </div>
                    <TextField autoFocus name="email" label="Email" type="email" className="w-full" isRequired value={data.email} onChange={(value) => setData('email', value)} placeholder="email@example.com" />
                    <Button type="submit" className="w-full" isDisabled={processing}>Submit</Button>
                </Form>
                <Link href={route('login')} className="text-start text-sm text-primary/50">Remember your password? Back to login</Link>
            </div>
        </RootWrapper>
    )
}