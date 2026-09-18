import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import Feedback from "../common/Feedback";
import { saveGeneratedPdf } from "../../Services/saveGeneratedPdf"

function Download() {
  const generatedContent = useSelector(
    (state) => state.Downloaded_pdf.generatedContent
  );

  const questions = generatedContent?.questions || [];

  function addHeader(doc) {
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text("Generated Questions", 20, 20);

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      20,
      28
    );

    doc.line(20, 32, 190, 32);
  }

  function addFooter(doc) {
    const page = doc.getNumberOfPages();

    doc.setFontSize(10);
    doc.setTextColor(120);

    doc.text(
      `Page ${page}`,
      doc.internal.pageSize.getWidth() / 2,
      290,
      {
        align: "center",
      }
    );

    doc.setTextColor(0);
  }

  function handleDownload() {
    if (!questions.length) {
      alert("No questions found.");
      return;
    }

    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    let y = 40;

    addHeader(doc);

    questions.forEach((q, index) => {
      const question = doc.splitTextToSize(
        `${index + 1}. ${q.question}`,
        maxWidth
      );

      const estimatedHeight =
        question.length * 7 +
        (q.options?.length || 0) * 12 +
        20;

      if (y + estimatedHeight > pageHeight - 20) {
        addFooter(doc);
        doc.addPage();
        addHeader(doc);
        y = 40;
      }

      // Question
      doc.setFont(undefined, "bold");
      doc.setFontSize(13);
      doc.text(question, margin, y);

      y += question.length * 7;

      // Options
      if (q.options) {
        doc.setFont(undefined, "normal");
        doc.setFontSize(11);

        q.options.forEach((option) => {
          const optionLines = doc.splitTextToSize(
            `• ${option}`,
            maxWidth - 10
          );

          doc.text(optionLines, margin + 8, y);

          y += optionLines.length * 6;
        });
      }

      // Answer
      doc.setFont(undefined, "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 120, 0);

      const answer = doc.splitTextToSize(
        `Answer: ${q.answer}`,
        maxWidth - 5
      );

      doc.text(answer, margin + 5, y);

      doc.setTextColor(0);

      y += answer.length * 7 + 10;
    });

    addFooter(doc);

    const date = new Date().toISOString().split("T")[0];

    doc.save(`Questions-${date}.pdf`);
    const title = generatedContent?.title || "Questions";
    saveGeneratedPdf(doc, "maxquestion", title);
      }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl max-w-lg mx-auto p-8 text-center transition-colors duration-300">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
        🎉 Questions Ready
      </h1>

      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Successfully generated{" "}
        <span className="font-bold text-indigo-600 dark:text-indigo-400">
          {questions.length}
        </span>{" "}
        questions.
      </p>

      <button
        onClick={handleDownload}
        disabled={!questions.length}
        className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 active:scale-[0.99] ${questions.length
          ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-md"
          : "bg-slate-400 dark:bg-slate-700 cursor-not-allowed"
          }`}
      >
        📄 Download PDF
      </button>
      <Feedback feedbackType="MCQ" />
    </div>
  );
}

export default Download;