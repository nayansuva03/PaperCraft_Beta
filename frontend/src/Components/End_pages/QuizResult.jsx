import React from "react";
import { useNavigate } from "react-router-dom";
import Feedback from "../common/Feedback";
import { generateQuizResultPdf } from "../../Services/generateQuizResultPdf";
import { saveGeneratedPdf } from "../../Services/saveGeneratedPdf";

function QuizResult({ questions, userAnswers, onRestart }) {
    const navigate = useNavigate();

    // Calculate the score
    const score = questions.reduce((total, question, index) => {
        const userAnswer = userAnswers[index];
        // Convert to lowercase and trim for safer comparison
        if (
            userAnswer &&
            userAnswer.toString().trim().toLowerCase() ===
            question.answer.toString().trim().toLowerCase()
        ) {
            return total + 1;
        }
        return total;
    }, 0);

    const percentage = Math.round((score / questions.length) * 100);

    const handleDownloadResult = async () => {
        const doc = generateQuizResultPdf(questions, userAnswers);

        const date = new Date().toISOString().split("T")[0];

        // Download locally
        doc.save(`Quiz-Result-${date}.pdf`);

        // Save to Cloudinary/backend

        await saveGeneratedPdf(
            doc,
            "quiz",
            `Quiz-Result-${date}`
        );
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 sm:p-10 rounded-3xl shadow-xl w-full max-w-3xl transition-colors duration-300 animate-in fade-in duration-200">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">Quiz Complete! 🎉</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Here is how you performed.</p>

                <div className="mt-6 inline-flex items-center justify-center w-32 h-32 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border-4 border-indigo-100 dark:border-indigo-800/60">
                    <div className="text-center">
                        <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{score}/{questions.length}</div>
                        <div className="text-xs font-bold text-indigo-400 dark:text-indigo-300">{percentage}%</div>
                    </div>
                </div>
            </div>

            <div className="space-y-6 mb-10 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {questions.map((q, index) => {
                    const userAnswer = userAnswers[index];
                    const isCorrect =
                        userAnswer &&
                        userAnswer.toString().trim().toLowerCase() ===
                        q.answer.toString().trim().toLowerCase();
                    const isSkipped = !userAnswer;

                    return (
                        <div
                            key={index}
                            className={`p-5 rounded-2xl border-2 transition-colors ${isCorrect
                                ? "border-green-100 dark:border-green-900/40 bg-green-50/30 dark:bg-green-950/20"
                                : isSkipped
                                    ? "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                                    : "border-red-100 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/20"
                                }`}
                        >
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3">
                                {index + 1}. {q.question}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shadow-sm">
                                    <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">Your Answer</span>
                                    <span className={`font-semibold ${isCorrect ? "text-green-600 dark:text-green-400" : isSkipped ? "text-slate-400 dark:text-slate-500" : "text-red-500 dark:text-red-400"}`}>
                                        {userAnswer ? userAnswer : "Not Answered"}
                                    </span>
                                </div>

                                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shadow-sm">
                                    <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">Correct Answer</span>
                                    <span className="font-semibold text-green-600 dark:text-green-400">{q.answer}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleDownloadResult}
                    className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md active:scale-[0.99] transition-all"
                >
                    Download Result
                </button>
                <button
                    onClick={onRestart}
                    className="flex-1 py-3.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-bold rounded-xl active:scale-[0.99] transition-all"
                >
                    Create New Quiz
                </button>
                <button
                    onClick={() => navigate("/HomeOptions")}
                    className="flex-1 py-3.5 bg-slate-800 dark:bg-slate-100 hover:bg-slate-900 dark:hover:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-md active:scale-[0.99] transition-all"
                >
                    Back to Dashboard
                </button>
            </div>
            <Feedback feedbackType="Quiz" />
        </div>
    );
}

export default QuizResult;