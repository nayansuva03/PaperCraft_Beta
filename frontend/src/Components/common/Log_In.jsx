import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
    setname,
    setemail,
    setisLoggedIn,
} from "../../Redux/userSlice.js";

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleOnSignin = () => navigate("/signIn");
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong While Loging in.");
            }
            console.log(data.message);
            dispatch(setname(data.user.name));
            dispatch(setemail(data.user.email));
            dispatch(setisLoggedIn(true));
            navigate("/");
        } catch (error) {
            alert(error.message);
        }
    }

    function handleForgotPassword() {
        navigate("/forgot-password");
    }

    return (

        <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-md transition-colors duration-300">

            <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-slate-100">
                Log In
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition"
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition"
                />

                <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 active:scale-[0.99] text-white rounded-lg p-3 font-semibold transition-all duration-200 shadow-sm"
                >
                    Log In
                </button>

                <div className="flex flex-col space-y-3 text-center pt-2">
                    <button
                        type="button"
                        onClick={handleOnSignin}
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors font-medium"
                    >
                        Don't have an account? Sign up
                    </button>

                    <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline transition-colors font-medium"
                    >
                        Forgot password?
                    </button>
                </div>

            </form>

        </div>

    );
}

export default Login;