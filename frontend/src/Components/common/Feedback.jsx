import { useState } from "react";
import { useSelector } from "react-redux";

function Feedback({ feedbackType }) {
    const name = useSelector((state) => state.user.name);
    const email = useSelector((state) => state.user.email);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSubmitting(true);
        let body;

        if (email) {
             body = {
                name: name,
                email: email,
                message,
                feedbackType,
            };
        } else {
             body = {
                guestName: `Guest_${Date.now()}`,
                message,
                feedbackType,
            };
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/feedback`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                }
            );

            if (!response.ok) throw new Error();

            alert("Thank you for your feedback ❤️");
            setMessage("");
        } catch (err) {
            alert("Couldn't submit feedback.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                How was your experience?
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <textarea
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl p-3.5 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition resize-none"
                        placeholder="Tell us what can be improved..."
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm py-3 rounded-xl font-medium transition duration-150"
                >
                    {isSubmitting ? "Sending..." : "Submit Feedback"}
                </button>
            </form>
        </div>
    );
}

export default Feedback;