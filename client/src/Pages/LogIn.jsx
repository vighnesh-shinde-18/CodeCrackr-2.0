import LoginForm from "../components/Authentication/login-form.jsx"
import { useLogin } from "../hooks/Security/useLogin.js";
function LogIn() {
    const loginMutation = useLogin();

    return (
        <section className="w-full flex flex-row justify-center pt-32">
            <LoginForm
                onSubmit={(data) => loginMutation.mutate(data)}
                loading={loginMutation.isPending}
            />
        </section>
    );
}

export default LogIn;