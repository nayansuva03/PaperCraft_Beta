import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setGeneratedContent, setLoading, setInstituteLogo, setBackgroundImage } from "../../Redux/download_Pdf_Slice";
import Loading from "../common/Loading";
import { generateContent } from "../../Services/generateContent";

function ExamPaperOptions() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector((state) => state.Downloaded_pdf.isLoading);
  const file = useSelector((state) => state.Uploaded_pdf.file);


  const [formData, setFormData] = useState({
    instituteName: "",
    instituteLogo: null,
    bgImage: null,
    courseStandard: "",
    subject: "",
    timeDuration: "",
    totalMarks: "",
    difficulty: "Medium",
    questionTypes: {
      mcq: { checked: false, Marks: 1, Main: 0, Optional: 0 },
      trueFalse: { checked: false, Marks: 1, Main: 0, Optional: 0 },
      oneLiner: { checked: false, Marks: 2, Main: 0, Optional: 0 },
      longQuestion: { checked: false, Marks: 5, Main: 0, Optional: 0 },
    },
  });

  const calculatedMarks =
    formData.questionTypes.mcq.Main * formData.questionTypes.mcq.Marks +
    formData.questionTypes.trueFalse.Main * formData.questionTypes.trueFalse.Marks +
    formData.questionTypes.oneLiner.Main * formData.questionTypes.oneLiner.Marks +
    formData.questionTypes.longQuestion.Main * formData.questionTypes.longQuestion.Marks;

  // Handle standard text, number, and select input adjustments
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Handle image/media file targets safely
  function handleFileChange(e) {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  }

  // Handle nested matrix checkbox evaluations
  function handleCheckboxChange(type, field) {
    setFormData((prev) => {
      const nextCheckedValue = !prev.questionTypes[type][field];
      return {
        ...prev,
        questionTypes: {
          ...prev.questionTypes,
          [type]: {
            ...prev.questionTypes[type],
            [field]: nextCheckedValue,

            Optional: nextCheckedValue ? prev.questionTypes[type].Optional : 0,
          },
        },
      };
    });
  }

  function handleMainCountChange(type, value) {
    if (value === "") {
      setFormData((prev) => ({
        ...prev,
        questionTypes: {
          ...prev.questionTypes,
          [type]: { ...prev.questionTypes[type], Main: "" },
        },
      }));
      return;
    }

    let numValue = parseInt(value, 10);
    if (numValue < 0) numValue = 0;

    setFormData((prev) => ({
      ...prev,
      questionTypes: {
        ...prev.questionTypes,
        [type]: {
          ...prev.questionTypes[type],
          Main: numValue,
        },
      },
    }));
  }
  function handleOptionalCountChange(type, value) {
    if (value === "") {
      setFormData((prev) => ({
        ...prev,
        questionTypes: {
          ...prev.questionTypes,
          [type]: { ...prev.questionTypes[type], Optional: "" },
        },
      }));
      return;
    }

    let numValue = parseInt(value, 10);
    if (numValue > 5) numValue = 5; // reset to 5 if number is large.
    if (numValue < 0) numValue = 0; // reset to 0 if number is in minuse.

    setFormData((prev) => ({
      ...prev,
      questionTypes: {
        ...prev.questionTypes,
        [type]: {
          ...prev.questionTypes[type],
          Optional: numValue,
        },
      },
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (
      !formData.instituteName ||
      !formData.subject ||
      !formData.totalMarks
    ) {
      alert(
        "Please fill Institute Name, Subject and Total Marks."
      );
      return;
    }

    const hasQuestionType = Object.values(
      formData.questionTypes
    ).some((q) => q.checked);

    if (!hasQuestionType) {
      alert("Please select at least one question type.");
      return;
    }
    if (calculatedMarks !== Number(formData.totalMarks)) {
      alert(
        `Total Marks mismatch!\n\nSelected Total Marks : ${formData.totalMarks}\nCalculated Marks : ${calculatedMarks}`
      );
      return;
    }

    handleFinalFunction();
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    })
  }

  async function handleFinalFunction() {
    const prompt = `

    generate an exampaper from given information.

Exam Information:

Institute: ${formData.instituteName}
Subject: ${formData.subject}
Course/Standard: ${formData.courseStandard}
Duration: ${formData.timeDuration}
Difficulty: ${formData.difficulty}
Total Marks: ${formData.totalMarks}

Marks for each type of question:
MCQs = 1,
True or False = 1,
One Liner Questions = 2,
Long Questions = 5.

generate ${formData.questionTypes.mcq.Main}  Main MCQs and ${formData.questionTypes.mcq.Optional} extra/optional MCQs Total ${formData.questionTypes.mcq.Main + formData.questionTypes.mcq.Optional}MCQs.
generate ${formData.questionTypes.trueFalse.Main}  Main True or False and ${formData.questionTypes.trueFalse.Optional} extra/optional True or False Total ${formData.questionTypes.trueFalse.Main + formData.questionTypes.trueFalse.Optional} True or False.
generate ${formData.questionTypes.oneLiner.Main}  Main One Liner Questions and ${formData.questionTypes.oneLiner.Optional} extra/optional One Liner Questions Total ${formData.questionTypes.oneLiner.Main + formData.questionTypes.oneLiner.Optional} One Liner Questions.
generate ${formData.questionTypes.longQuestion.Main}  Main Long Questions and ${formData.questionTypes.longQuestion.Optional} extra/optional Long Questions Total ${formData.questionTypes.longQuestion.Main + formData.questionTypes.longQuestion.Optional} Long Questions.

**Here is an example of what kind of response i want.**
**EXAMPLE 1:
suppsose i give you information like this:

Exam Information:

Institute: ABC School
Subject: English
Course/Standard: class 5
Duration: 1 Hour
Difficulty: Medium
Total Marks: 50

generate 10  Main MCQs and 0 extra/optional MCQs Total 10 MCQs.
generate 10  Main True or False and 0 extra/optional True or False Total 10 True or False.
generate 5  Main One Liner Questions and 2 extra/optional One Liner Questions Total 7 One Liner Questions.
generate 4 Main Long Questions and 2 extra/optional Long Questions Total 6 Long Questions.

then i acpect below response from you.

{
  "header": {
    "institute": "ABC School",
    "subject": "English",
    "course_standard": "Class 5",
    "duration": "1 Hour",
    "difficulty": "Medium",
    "total_marks": 50
  },
  "questions": {
    "section_A": {
      "title": "Choose correct option from below MCQs",
      "questions": [
        {
          "id": "q1",
          "question": "Which of the following is a synonym for 'happy'?",
          "options": ["A) Sad", "B) Joyful", "C) Angry", "D) Tired"]
        },
        {
          "id": "q2",
          "question": "Identify the noun in the sentence: 'The dog barked loudly.'",
          "options": ["A) Barked", "B) Loudly", "C) Dog", "D) The"]
        },
        {
          "id": "q3",
          "question": "Choose the correct pronoun: 'Mary completed _____ homework.'",
          "options": ["A) his", "B) her", "C) their", "D) its"]
        },
        {
          "id": "q4",
          "question": "What is the past tense of the verb 'run'?",
          "options": ["A) Running", "B) Runs", "C) Ran", "D) Runned"]
        },
        {
          "id": "q5",
          "question": "Pick the correct article: 'I saw _____ owl sitting on the branch.'",
          "options": ["A) a", "B) an", "C) the", "D) no article"]
        },
        {
          "id": "q6",
          "question": "Which word is an adjective in 'She wore a beautiful dress'?",
          "options": ["A) She", "B) Wore", "C) Beautiful", "D) Dress"]
        },
        {
          "id": "q7",
          "question": "What is the opposite of 'difficult'?",
          "options": ["A) Easy", "B) Hard", "C) Tough", "D) Complex"]
        },
        {
          "id": "q8",
          "question": "Select the correctly spelled word:",
          "options": ["A) Beatiful", "B) Beautiful", "C) Beautifull", "D) Beutiful"]
        },
        {
          "id": "q9",
          "question": "Which punctuation mark ends an interrogative sentence?",
          "options": ["A) Period (.)", "B) Exclamation mark (!)", "C) Question mark (?)", "D) Comma (,)"]
        },
        {
          "id": "q10",
          "question": "Choose the plural form of 'child':",
          "options": ["A) Childs", "B) Childrens", "C) Children", "D) Childes"]
        }
      ]
    },
    "section_B": {
      "title": "State whether the following statements are True or False",
      "questions": [
        "q1: A proper noun always begins with a capital letter.",
        "q2: The word 'quickly' is an adjective.",
        "q3: 'They' is an example of a plural pronoun.",
        "q4: An antonym is a word that means the same as another word.",
        "q5: 'Silent' and 'Listen' contain the exact same letters.",
        "q6: A conjunction is used to connect words or sentences.",
        "q7: The past tense of 'go' is 'goed'.",
        "q8: 'An' is used before words starting with a vowel sound.",
        "q9: A sentence can be complete without a verb.",
        "q10: The comparative degree of 'good' is 'better'."
      ]
    },
    "section_C": {
      "title": "Give Answer to below questions in one line",
      "questions": [
        "q1: What is a noun? Define in one sentence.",
        "q2: Give one example of a preposition.",
        "q3: Write the compound word formed by joining 'sun' and 'flower'.",
        "q4: Change the sentence into a question: 'He is reading a book.'",
        "q5: What is the plural form of 'foot'?",
        "q6: Name the subject in the sentence: 'The birds are flying in the sky.'",
        "q7: Write a word that rhymes with 'light'."
      ]
    },
    "section_D": {
      "title": "Answer the following long questions in detail",
      "questions": [
        "q1: Write a short paragraph (5-6 sentences) describing your favorite hobby.",
        "q2: Read the story snippet and answer: 'Once a lion was sleeping under a tree. A little mouse started playing on him...' Why did the lion wake up and what did he decide to do with the mouse?",
        "q3: Write a formal application to your school principal requesting two days of sick leave.",
        "q4: Explain the difference between a Proper Noun and a Common Noun with two examples for each.",
        "q5: Write a short descriptive essay on 'A Rainy Day'.",
        "q6: Describe the main character from any storybook you recently read."
      ]
    }
  },
  "answers": {
    "section_A": {
      "answers": [
        "q1: B) Joyful",
        "q2: C) Dog",
        "q3: B) her",
        "q4: C) Ran",
        "q5: B) an",
        "q6: C) Beautiful",
        "q7: A) Easy",
        "q8: B) Beautiful",
        "q9: C) Question mark (?)",
        "q10: C) Children"
      ]
    },
    "section_B": {
      "answers": [
        "q1: True",
        "q2: False (It is an adverb)",
        "q3: True",
        "q4: False (An antonym is an opposite word)",
        "q5: True",
        "q6: True",
        "q7: False (The past tense is 'went')",
        "q8: True",
        "q9: False",
        "q10: True"
      ]
    },
    "section_C": {
      "answers": [
        "q1: A noun is the name of a person, place, animal, or thing.",
        "q2: Under (or on, in, at, beside).",
        "q3: Sunflower.",
        "q4: Is he reading a book?",
        "q5: Feet.",
        "q6: The birds.",
        "q7: Night (or bright, sight, kite)."
      ]
    },
    "section_D": {
      {
  "answers": [
  "q1: answer",
  "q2: answer",
  "q3: answer",
  "q4: answer",
  "q5: answer",
  "q6: answer",
  ]
}
    }
  }
}



**EXAMPLE 2:
suppsose i give you information like this:

Exam Information:

Institute: ABC School
Subject: English
Course/Standard: class 5
Duration: 1 Hour
Difficulty: Medium
Total Marks: 25

generate 5  Main MCQs and 0 extra/optional MCQs Total 5 MCQs.
generate 0  Main True or False and 0 extra/optional True or False Total 0 True or False.
generate 5  Main One Liner Questions and 2 extra/optional One Liner Questions Total 7 One Liner Questions.
generate 2 Main Long Questions and 1 extra/optional Long Questions Total 3 Long Questions.

then i acpect below response from you.

{
  "header": {
    "institute": "ABC School",
    "subject": "English",
    "course_standard": "Class 5",
    "duration": "1 Hour",
    "difficulty": "Medium",
    "total_marks": 25
  },
  "questions": {
    "section_A": {
      "title": "Choose correct option from below MCQs",
      "questions": [
        {
          "id": "q1",
          "question": "Which word is a noun?",
          "options": ["A) Run", "B) Beautiful", "C) School", "D) Quickly"]
        },
        {
          "id": "q2",
          "question": "Choose the correct plural form of 'mouse'.",
          "options": ["A) Mouses", "B) Mice", "C) Mousees", "D) Mousen"]
        },
        {
          "id": "q3",
          "question": "Which sentence is correct?",
          "options": [
            "A) She go to school.",
            "B) She goes to school.",
            "C) She going school.",
            "D) She gone school."
          ]
        },
        {
          "id": "q4",
          "question": "Which punctuation mark ends a question?",
          "options": ["A) .", "B) ,", "C) ?", "D) !"]
        },
        {
          "id": "q5",
          "question": "Choose the opposite of 'strong'.",
          "options": ["A) Weak", "B) Hard", "C) Brave", "D) Tall"]
        }
      ]
    },
    "section_B": {
      "title": "Give Answer to below questions in one line",
      "questions": [
        "q1: Define an adjective.",
        "q2: Write one example of a pronoun.",
        "q3: What is the past tense of 'eat'?",
        "q4: Write the plural form of 'leaf'.",
        "q5: What is a sentence?",
        "q6: Give one example of a conjunction.",
        "q7: Write a synonym of 'big'."
      ]
    },
    "section_C": {
      "title": "Answer the following long questions in detail",
      "questions": [
        "q1: Write a paragraph (5-6 sentences) about your favorite festival.",
        "q2: Explain the difference between a noun and a verb with examples.",
        "q3: Write an application to your class teacher requesting one day's leave."
      ]
    }
  },
  "answers": {
    "section_A": {
      "answers": [
        "q1: C) School",
        "q2: B) Mice",
        "q3: B) She goes to school.",
        "q4: C) ?",
        "q5: A) Weak"
      ]
    },
    "section_B": {
      "answers": [
        "q1: An adjective is a word that describes a noun or pronoun.",
        "q2: He (or She, They, We, I).",
        "q3: Ate.",
        "q4: Leaves.",
        "q5: A sentence is a group of words that expresses a complete thought.",
        "q6: And (or But, Because, Or).",
        "q7: Large (or Huge)."
      ]
    },
    "section_C": {
      "answers": [
        "q1: answer",
        "q2: answer",
        "q3: answer"
      ]
    }
  }
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
      let backgroundImageBase64 = null;
      if (formData.bgImage) {
        try {
          backgroundImageBase64 = await fileToBase64(formData.bgImage);
          console.log("Background image converted to Base64");
          dispatch(setBackgroundImage(backgroundImageBase64));
        } catch (error) {
          console.warn("Could not convert background image:", error);
        }
      }

      let instituteLogoBase64 = null;
      if (formData.instituteLogo) {
        try {
          instituteLogoBase64 = await fileToBase64(formData.instituteLogo);
          console.log("Institute Logo converted to Base64");
          dispatch(setInstituteLogo(instituteLogoBase64));
        } catch (error) {
          console.warn("Could not convert Institute Logo:", error);
        }
      }

      dispatch(setGeneratedContent(result));
      console.log("RESULT =", result);
      console.log("TYPE =", typeof result);
      console.log("IS ARRAY =", Array.isArray(result));
      console.log("HEADER =", result?.header);
      console.log("QUESTIONS =", result?.questions);
      navigate("/examPaperDownload");
    } catch (err) {
      console.error(err);
      alert("Failed to generate exam paper.");
    } finally {
      dispatch(setLoading(false));
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
    <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-xl w-full max-w-2xl border border-slate-100 dark:border-slate-800 transition-colors duration-300 animate-in fade-in duration-200">
      <NavLink to="/HomeOptions" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-semibold text-xs flex items-center gap-1 mb-6 transition-colors">
        ← Back
      </NavLink>

      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Exam Paper Parameters</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure structural layout properties and content metrics for evaluation.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Core Identity Parameters Context Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-slate-700 dark:text-slate-300 font-bold text-sm mb-1.5">Institute Name</label>
            <input
              type="text"
              name="instituteName"
              value={formData.instituteName}
              onChange={handleInputChange}
              placeholder="e.g. Stanford University or ABC High School"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-shadow"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold text-sm mb-1.5">Institute Logo</label>
            <input
              type="file"
              name="instituteLogo"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950/60 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/60 cursor-pointer border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold text-sm mb-1.5">Background Watermark / Image</label>
            <input
              type="file"
              name="bgImage"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950/60 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/60 cursor-pointer border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold text-sm mb-1.5">Course / Standard</label>
            <input
              type="text"
              name="courseStandard"
              value={formData.courseStandard}
              onChange={handleInputChange}
              placeholder="e.g. B.Tech Semester IV or Class 12"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-shadow"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold text-sm mb-1.5">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="e.g. Database Management Systems"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-shadow"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold text-sm mb-1.5">Time Duration</label>
            <input
              type="text"
              name="timeDuration"
              value={formData.timeDuration}
              onChange={handleInputChange}
              placeholder="e.g. 3 Hours or 90 Mins"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-shadow"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold text-sm mb-1.5">Total Marks</label>
            <input
              type="number"
              name="totalMarks"
              value={formData.totalMarks}
              onChange={handleInputChange}
              placeholder="e.g. 70 or 100"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-shadow"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-700 dark:text-slate-300 font-bold text-sm mb-1.5">Difficulty Profile</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-shadow"
            >
              <option value="Easy">Easy (Conceptual Fundamentals)</option>
              <option value="Medium">Medium (Balanced Analysis)</option>
              <option value="Hard">Hard (Complex Architecture Problems)</option>
            </select>
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* Specialized Structural Checkbox Selection Layer */}
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-bold text-sm mb-3">Questions Structural Configuration Matrix</label>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700/60 overflow-hidden">

            {[
              { id: "mcq", label: "MCQs (Marks : 1)" },
              { id: "trueFalse", label: "True / FalseMCQs (Marks : 1)" },
              { id: "oneLiner", label: "One Liner QuestionsMCQs (Marks : 2)" },
              { id: "longQuestion", label: "Long QuestionsMCQs (Marks : 5)" },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 transition-colors duration-150">
                {/* Main Checkbox Context */}
                <label className="flex items-center gap-3 cursor-pointer select-none font-semibold text-slate-700 dark:text-slate-200 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.questionTypes[item.id].checked}
                    onChange={() => handleCheckboxChange(item.id, "checked")}
                    className="w-4 h-4 rounded text-indigo-600 dark:text-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-indigo-500 transition-colors"
                  />
                  {item.label}
                </label>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium transition-colors duration-150 ${formData.questionTypes[item.id].checked ? "text-slate-600 dark:text-slate-300" : "text-slate-300 dark:text-slate-600"
                      }`}
                  >
                    Main
                  </span>
                  <input
                    type="number"
                    min="0"
                    disabled={!formData.questionTypes[item.id].checked}
                    value={formData.questionTypes[item.id].Main}
                    onChange={(e) => handleMainCountChange(item.id, e.target.value)}
                    className="w-14 px-2 py-1 text-center text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-900/40 disabled:text-slate-300 dark:disabled:text-slate-600 transition-all shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium transition-colors duration-150 ${formData.questionTypes[item.id].checked ? "text-slate-600 dark:text-slate-300" : "text-slate-300 dark:text-slate-600"
                      }`}
                  >
                    Optional
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    disabled={!formData.questionTypes[item.id].checked}
                    value={formData.questionTypes[item.id].Optional}
                    onChange={(e) => handleOptionalCountChange(item.id, e.target.value)}
                    className="w-14 px-2 py-1 text-center text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-900/40 disabled:text-slate-300 dark:disabled:text-slate-600 transition-all shadow-sm"
                  />
                </div>
              </div>
            ))}

          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 active:scale-[0.99] text-white font-bold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          Generate Exam Paper 🚀
        </button>
      </form>
    </div>
  );
}

export default ExamPaperOptions;