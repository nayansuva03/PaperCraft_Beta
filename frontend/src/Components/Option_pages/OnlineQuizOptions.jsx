import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setGeneratedContent, setLoading } from "../../Redux/download_Pdf_Slice";
import Loading from "../common/Loading";
import { generateContent } from "../../Services/generateContent";

function OnlineQuizOptions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector((state) => state.Downloaded_pdf.isLoading);
  const file = useSelector((state) => state.Uploaded_pdf.file);
  const [quizType, setQuizType] = useState("mcq"); // Default selection
  const [numQuestions, setNumQuestions] = useState(10);

  function handleQuantityChange(e) {
    const value = parseInt(e.target.value, 10);
    if (!value) {
      setNumQuestions("");
      return;
    }
    // Cap at 50 max
    if (value > 50) {
      setNumQuestions(50);
    } else {
      setNumQuestions(value);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!numQuestions || numQuestions < 1) {
      alert("Please enter a valid number of questions (1 - 50)");
      return;
    }
    handleFinalFunction();
  }

  async function handleFinalFunction() {
    const prompt = `
      Create ${numQuestions}${quizType === 'mcq' ? "MCQ Questions." : "True or False Questions."} based on the info i have given you.
      Give only a valid json array of objects simmilar to given example and don't include/cover json with ${"```"}. 

      **Example if MCQs:
    {
    "questions": [
        {
          "id": "q1",
          "question": "Which word is a noun?",
          "options": ["A) Run", "B) Beautiful", "C) School", "D) Quickly"],
          "answer": "C) School"
        },
        {
          "id": "q2",
          "question": "Which word is a noun?",
          "options": ["A) Run", "B) Beautiful", "C) School", "D) Quickly"],
          "answer": "C) School"
        }
    ]
    }
        **Example if True or False:
    {
        "questions":[
    {
    "id": "q1",
    "question": "A proper noun always begins with a capital letter.",
    "answer": "True"    
    },
    {
    "id": "q2",
    "question": "The word 'quickly' is an adjective.",
    "answer": "False"    
    }
        ]
    }

      `;
    try {
      dispatch(setLoading(true));
      console.log(prompt);
      const result = await generateContent(prompt, file);
      dispatch(setGeneratedContent(result));
      dispatch(setLoading(false));
      navigate("/onlinequiz");
    } catch (err) {
      dispatch(setLoading(false));
      console.error(err);
      alert("Failed to generate questions. (from onlineQuizOptions.jsx)");
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-xl w-full max-w-md border border-slate-100 dark:border-slate-800 transition-colors duration-300 animate-in fade-in duration-200">
      <NavLink className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-semibold text-xs flex items-center gap-1 mb-6 transition-colors" to="/HomeOptions">
        ← Back
      </NavLink>

      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
          Quiz Configurations
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Set up your live sandbox assessment preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Type Selection */}
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-bold text-sm mb-3">
            Quiz Question Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setQuizType("mcq")}
              className={`p-4 rounded-xl border-2 text-center cursor-pointer transition-all ${quizType === "mcq"
                  ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50 font-bold text-indigo-600 dark:text-indigo-400"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                }`}
            >
              <div className="text-2xl mb-1">🎯</div>
              <div className="text-sm">MCQs</div>
            </div>

            <div
              onClick={() => setQuizType("true_false")}
              className={`p-4 rounded-xl border-2 text-center cursor-pointer transition-all ${quizType === "true_false"
                  ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50 font-bold text-indigo-600 dark:text-indigo-400"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                }`}
            >
              <div className="text-2xl mb-1">⚖️</div>
              <div className="text-sm">True / False</div>
            </div>
          </div>
        </div>

        {/* Step 2: Quantity Input Box */}
        <div>
          <label
            className="block text-slate-700 dark:text-slate-300 font-bold text-sm mb-2"
            htmlFor="quantity"
          >
            Number of Questions{" "}
            <span className="text-slate-400 dark:text-slate-500 font-normal">(Max 50)</span>
          </label>
          <input
            id="quantity"
            type="number"
            min="1"
            max="50"
            value={numQuestions}
            onChange={handleQuantityChange}
            placeholder="e.g. 15"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-shadow"
          />
        </div>

        {/* Action Controls */}
        <button
          type="submit"
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 active:scale-[0.99] text-white font-bold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          Initialize Quiz Setup 🚀
        </button>
      </form>
    </div>
  );
}

export default OnlineQuizOptions;