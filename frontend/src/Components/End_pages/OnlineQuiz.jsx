import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import QuizResult from "./QuizResult";

function OnlineQuiz() {
    const navigate = useNavigate();
    // Assuming 'generatedContent' stores the raw response from Gemini
    const rawContent = useSelector((state) => state.Downloaded_pdf.generatedContent);

    const [quizData, setQuizData] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!rawContent || !rawContent.questions) {
            setError("No quiz data found. Please generate a quiz first.");
            return;
        }

        try {
            // rawContent is already { questions: [...] }
            const parsed = rawContent.questions;

            if (Array.isArray(parsed) && parsed.length > 0) {
                setQuizData(parsed);
            } else {
                throw new Error("Invalid format");
            }
        } catch (err) {
            console.error("JSON Parsing Error:", err);
            setError("Failed to parse the quiz data. The AI returned an unexpected format.");
        }
    }, [rawContent]);

    const handleOptionSelect = (option) => {
        setUserAnswers((prev) => ({
            ...prev,
            [currentIndex]: option,
        }));
    };

    const handleNext = () => {
        if (currentIndex < quizData.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleSubmit = () => {
        // Optional: Check if all questions are answered
        if (Object.keys(userAnswers).length < quizData.length) {
            const confirmSubmit = window.confirm("You have unanswered questions. Submit anyway?");
            if (!confirmSubmit) return;
        }
        setIsSubmitted(true);
    };

    if (error) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl shadow-xl w-full max-w-md text-center transition-colors duration-300">
                <p className="text-red-500 font-bold mb-4">{error}</p>
                <button
                    onClick={() => navigate("/OnlineQuizOptions")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 active:scale-[0.99] text-white font-semibold rounded-xl transition"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (quizData.length === 0) {
        return <div className="text-slate-600 dark:text-slate-400 font-bold p-8">Loading quiz...</div>;
    }

    // If submitted, show the results component
    if (isSubmitted) {
        return <QuizResult questions={quizData} userAnswers={userAnswers} onRestart={() => navigate("/HomeOptions/OnlineQuizOptions")} />;
    }

    const currentQuestion = quizData[currentIndex];
    // If the AI forgot to provide options (e.g., for True/False), supply defaults
    const options = currentQuestion.options || ["True", "False"];
    const selectedAnswer = userAnswers[currentIndex];

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 sm:p-10 rounded-3xl shadow-xl w-full max-w-2xl transition-colors duration-300 animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
                    Question {currentIndex + 1} of {quizData.length}
                </span>
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 text-xs font-bold rounded-full">
                    Live Sandbox
                </span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-6">
                {currentQuestion.question}
            </h2>

            <div className="space-y-3 mb-8">
                {options.map((option, idx) => {
                    const isSelected = selectedAnswer === option;
                    return (
                        <button
                            key={idx}
                            onClick={() => handleOptionSelect(option)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 active:scale-[0.99] ${isSelected
                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold dark:border-indigo-500"
                                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600"
                                }`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-between items-center mt-8">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="px-6 py-3 font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-30 transition-colors"
                >
                    Previous
                </button>

                {currentIndex === quizData.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold rounded-xl shadow-md active:scale-[0.99] transition-all"
                    >
                        Submit Quiz
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="px-8 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-bold rounded-xl shadow-md active:scale-[0.99] transition-all"
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
}

export default OnlineQuiz;