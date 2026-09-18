import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Navbar from "./Components/common/Navbar";
import PdfUploadPage from "./Components/home/PdfUploadPage";
import About from "./Components/home/AboutPage";
import SavedServices from "./Components/home/SavedServices";
import HomeOptions from "./Components/home/HomeOptions";
import MaxQuestOption from "./Components/Option_pages/MaxQuestOption";
import OnlineQuizOptions from "./Components/Option_pages/OnlineQuizOptions";
import ExamPaperOptions from "./Components/Option_pages/ExamPaperOptions";
import MaxQuestDownload from "./Components/End_pages/MaxQuestDownload";
import ExamPaperDownload from "./Components/End_pages/ExamPaperDownload";
import QuizResult from "./Components/End_pages/QuizResult";
import OnlineQuiz from "./Components/End_pages/OnlineQuiz";
import LogIn from "./Components/common/Log_In";
import SignIn from "./Components/common/Sign_In";
import ForgotPassword from "./Components/common/Forgot_password";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setname, setemail, setisLoggedIn } from "./Redux/userSlice";

function App() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);

  function loginUser(user) {
    dispatch(setname(user.name));
    dispatch(setemail(user.email));
    dispatch(setisLoggedIn(true));
  }

  function logoutUser() {
    dispatch(setname(""));
    dispatch(setemail(""));
    dispatch(setisLoggedIn(false));
  }

  async function checkAuth() {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();

        loginUser(data.user);

        return;
      }

      if (response.status !== 401) {
        logoutUser();
        return;
      }

      const refreshResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh-token`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!refreshResponse.ok) {
        logoutUser();
        return;
      }

      const retryResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
        credentials: "include",
      });
      if (retryResponse.ok) {
        const data = await retryResponse.json();

        loginUser(data.user);

        return;
      }
      logoutUser();
      return;
      
    } catch (error) {
      console.error(error);
      logoutUser();
    }
  }
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <main className="flex justify-center items-center py-10 px-4">
        <Routes>
          <Route path="/" element={<PdfUploadPage />} />
          <Route path="/SavedServices" element={<SavedServices />} />
          <Route path="/About" element={<About />} />
          <Route path="/LogIn" element={<LogIn />} />
          <Route path="/signIn" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/HomeOptions" element={<HomeOptions />} />
          <Route path="/HomeOptions/MaxQuestOption" element={<MaxQuestOption />} />
          <Route path="/HomeOptions/OnlineQuizOptions" element={<OnlineQuizOptions />} />
          <Route path="/HomeOptions/ExamPaperOptions" element={<ExamPaperOptions />} />
          <Route path="/MaxQuestDownload" element={<MaxQuestDownload />} />
          <Route path="/examPaperDownload" element={<ExamPaperDownload />} />
          <Route path="/onlinequiz" element={<OnlineQuiz />} />
          <Route path="/QuizResult" element={<QuizResult />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;