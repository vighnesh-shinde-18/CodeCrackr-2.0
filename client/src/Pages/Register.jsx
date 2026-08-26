import RegisterForm from "../components/Authentication/register-form.jsx";
import { useRegister } from "../hooks/Security/useRegister.js";
 
function Register() {
    const registerMutation = useRegister();

    return (
        <section className="w-full flex flex-row justify-center pt-32">
            <RegisterForm 
                onSubmit={(data) => registerMutation.mutate(data)} 
                loading={registerMutation.isPending} 
            />
        </section>
    );
}

export default Register;