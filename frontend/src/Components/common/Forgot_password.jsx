import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {

    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");

    const [passwords, setPasswords] = useState({
        password: "",
        confirmPassword: ""
    });

    async function handleEmailSend(e) {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email}),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "eroor sending email.");
            }

            console.log(data.message);
            setStep(2);

        } catch (error) {
            console.error(error);
        }
    }

    async function verifyOTP(e) {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-forgot-password`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    otp,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong while sending otp to backend")
            }

            console.log(data.message);

            setStep(3);

        } catch (error) {
            console.error(error);
        }
    }

    async function resetPassword(e) {
        e.preventDefault();
        if (passwords.password !== passwords.confirmPassword) {
            console.error("Passwords do not match");
            return;
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email, password: passwords.password}),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong while sending resetPassword to backend")
            }
            console.log(data.message);
            navigate("/")
        } catch (error) {
            console.error(error);
        }
    }

    return (

        <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-md transition-colors duration-300">

            <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-slate-100">
                Forgot Password
            </h1>

            {step === 1 && (

                <div className="space-y-4">

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition"
                    />

                    <button
                        onClick={handleEmailSend}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 active:scale-[0.99] text-white rounded-lg p-3 font-semibold transition-all duration-200 shadow-sm"
                    >
                        Send OTP
                    </button>

                </div>

            )}

            {step === 2 && (

                <div className="space-y-4">

                    <input
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition"
                    />

                    <button
                        onClick={verifyOTP}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 active:scale-[0.99] text-white rounded-lg p-3 font-semibold transition-all duration-200 shadow-sm"
                    >
                        Verify OTP
                    </button>

                </div>

            )}

            {step === 3 && (

                <div className="space-y-4">

                    <input
                        type="password"
                        placeholder="New Password"
                        value={passwords.password}
                        onChange={(e) =>
                            setPasswords({
                                ...passwords,
                                password: e.target.value
                            })
                        }
                        className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition"
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={passwords.confirmPassword}
                        onChange={(e) =>
                            setPasswords({
                                ...passwords,
                                confirmPassword: e.target.value
                            })
                        }
                        className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition"
                    />

                    <button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 active:scale-[0.99] text-white rounded-lg p-3 font-semibold transition-all duration-200 shadow-sm"
                        onClick={resetPassword}
                    >
                        Change Password
                    </button>

                </div>

            )}

        </div>

    );
}

export default ForgotPassword;