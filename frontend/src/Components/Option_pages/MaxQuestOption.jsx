import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setGeneratedContent, setLoading } from "../../Redux/download_Pdf_Slice";
import Loading from "../common/Loading";
import { generateContent } from "../../Services/generateContent";

function MaxQuestOption() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const file = useSelector((state) => state.Uploaded_pdf.file);
  const isLoading = useSelector((state) => state.Downloaded_pdf.isLoading);
  const options = [
    {
      id: "mcq",
      title: "Multiple Choice (MCQs)",
      icon: "🎯",
      desc: "Standard format options with a single right answer.",
    },
    {
      id: "true_false",
      title: "True / False",
      icon: "⚖️",
      desc: "Quick conceptual assertion verification statements.",
    },
    {
      id: "one_liner",
      title: "One Liner Questions",
      icon: "✏️",
      desc: "Short precise direct answer point benchmarks.",
    },
    {
      id: "long_question",
      title: "Long Questions",
      icon: "📖",
      desc: "Detailed breakdown descriptive assessment topics.",
    },
  ];

  async function handleSelect(questionType) {
    const prompt = `
      Generate Maximum ${questionType}. and only give it in a valid json formate.

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

    **Example if one liner questions:
    {
        "questions":[
    {
    "id": "q1",
    "question": "What is a noun? Define in one sentence.",
    "answer": "A noun is the name of a person, place, animal, or thing."    
    },
    {
    "id": "q2",
    "question": "Give one example of a preposition.",
    "answer": "Under (or on, in, at, beside)."    
    }
        ]
    }

    **Example if long questions:
    {
        "questions":[
    {
    "id": "q1",
    "question": "Write a short paragraph (5-6 sentences) describing your favorite hobby.",
    "answer": "answer"    
    },
    {
    "id": "q2",
    "question": "Read the story snippet and answer: 'Once a lion was sleeping under a tree. A little mouse started playing on him...' Why did the lion wake up and what did he decide to do with the mouse?",
    "answer": "answer"    
    }
        ]
    }

    **If you cannot satisfy all requirements because the supplied text is insufficient, return

{
    "success": false,
    "reason": "Not enough information in the provided text."
}

instead of generating incorrect questions.
      `;

    try {
      dispatch(setLoading(true));
      console.log(prompt);
      const result = await generateContent(prompt, file);
      dispatch(setGeneratedContent(result));
      dispatch(setLoading(false));
      navigate("/MaxQuestDownload");
    } catch (err) {
      dispatch(setLoading(false));
      console.error(err);
      alert("Failed to generate questions.(from MaxQuestOption.jsx)");
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
    <div className="w-full max-w-4xl px-4 py-8 mx-auto animate-in fade-in duration-200">
      <NavLink
        to="/HomeOptions"
        className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold text-sm flex items-center gap-2 mb-6 transition-colors"
      >
        ← Back to Options
      </NavLink>

      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
          Select Target Format
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Pick the specific structure layout for your mass question build
          pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {options.map((opt) => (
          <div
            key={opt.id}
            onClick={() => handleSelect(opt.title)}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-lg transition-all duration-200 cursor-pointer flex items-start gap-4 group"
          >
            <span className="text-3xl p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 transition-colors">
              {opt.icon}
            </span>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {opt.title}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                {opt.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MaxQuestOption;