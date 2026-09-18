import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
    setname,
    setemail,
    setisLoggedIn,
} from "../../Redux/userSlice.js";

function SignIn() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleOnLogin = () => navigate("/LogIn");

    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
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
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to send sign in formdata");
            }


            alert(data.message);

            setShowOTP(true);

        } catch (error) {
            console.error("Error sending sign in formdata", error);
        }
    }

    async function handleOtpSubmit(e) {
        e.preventDefault();

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    formData: formData,
                    otp,
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong sending OTP.");
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

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-md transition-colors duration-300">

            {!showOTP ? (
                <>
                    <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-slate-100">
                        Sign In
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            name="name"
                            placeholder="Name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition"
                        />

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
                            placeholder="Set Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition"
                        />

                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition"
                        />

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 active:scale-[0.99] text-white rounded-lg p-3 font-semibold transition-all duration-200 shadow-sm"
                        >
                            Create Account
                        </button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={handleOnLogin}
                                className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors font-medium"
                            >
                                Already have an account? Log in
                            </button>
                        </div>
                    </form>
                </>
            ) : (
                <>
                    <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                        Verify Email
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                        We've sent a verification code to <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.email || "your email"}</span>.
                    </p>

                    <form onSubmit={handleOtpSubmit} className="space-y-4">
                        <input
                            name="otp"
                            type="text"
                            maxLength="6"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full text-center tracking-widest text-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition"
                        />

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 active:scale-[0.99] text-white rounded-lg p-3 font-semibold transition-all duration-200 shadow-sm"
                        >
                            Verify & Create Account
                        </button>

                        <div className="flex justify-between items-center text-sm pt-2">
                            <button
                                type="button"
                                onClick={() => setShowOTP(false)}
                                className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors font-medium"
                            >
                                ← Back
                            </button>
                            <button
                                type="button"
                                className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors font-medium"
                            >
                                Resend Code
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}

export default SignIn;