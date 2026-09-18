import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

function HomeOptions() {

  return (
    <div className="w-full max-w-5xl px-4 py-8 mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-3 tracking-tight">
          Choose Your Mode ✨
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
          Select how you want to transform your learning materials today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center pt-4">

        {/* Card 1: Online Quiz */}
        <NavLink to="/HomeOptions/OnlineQuizOptions">
          <div
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-72 justify-between group"
          >
            <div>
              <div className="text-4xl mb-4 p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit group-hover:scale-110 transition-transform">⚡</div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Online Quiz</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Test your knowledge instantly with rapid-fire customizable quiz sessions.
              </p>
            </div>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Start Quiz →
            </span>
          </div>
        </NavLink>


        {/* Card 2: Generate Maximum Questions (Elevated & Larger) */}
        <NavLink to="/HomeOptions/MaxQuestOption">
          <div
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border-2 border-indigo-500 md:-translate-y-4 md:scale-105 transition-all duration-300 cursor-pointer flex flex-col h-80 justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 bg-indigo-600 dark:bg-indigo-500 text-white text-xs font-extrabold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">
              Most Popular
            </div>
            <div className="mt-2">
              <div className="text-4xl mb-4 p-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl w-fit group-hover:rotate-6 transition-transform">🚀</div>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">Generate Max Questions</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Extract every bit of knowledge. Generate comprehensive lists of varying question formats.
              </p>
            </div>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Explore Formats →
            </span>
          </div>
        </NavLink>


        {/* Card 3: Make Exam Papers */}
        <NavLink to="/HomeOptions/ExamPaperOptions">
          <div
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-72 justify-between group"
          >
            <div>
              <div className="text-4xl mb-4 p-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl w-fit group-hover:scale-110 transition-transform">📝</div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Make Exam Papers</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Structure systematic printable standard evaluation blueprints.
              </p>
            </div>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Explore Formats →
            </span>
          </div>
        </NavLink>


      </div>
    </div>
  );
}

export default HomeOptions;