function Loading() {
  return (
    <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl dark:shadow-slate-950/50 w-full max-w-md flex flex-col items-center justify-center gap-8 border border-slate-100 dark:border-slate-800 min-h-[400px] transition-colors duration-300">
      <div className="relative flex justify-center items-center">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-600 dark:border-indigo-500"></div>
        <div className="absolute text-3xl animate-pulse">⚙️</div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Analyzing PDF</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">Please wait this can take some time.</p>
      </div>
    </div>
  );
}

export default Loading;