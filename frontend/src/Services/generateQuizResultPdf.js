import jsPDF from "jspdf";

export function generateQuizResultPdf(questions, userAnswers) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 20;
  const maxWidth = pageWidth - margin * 2;

  let y = 40;

  // Calculate score
  const score = questions.reduce((total, question, index) => {
    const userAnswer = userAnswers[index];

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

  function addHeader() {
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text("Quiz Result", margin, 20);

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 28);

    doc.line(margin, 32, pageWidth - margin, 32);
  }

  function addFooter() {
    const page = doc.getNumberOfPages();

    doc.setFontSize(10);
    doc.setTextColor(120);

    doc.text(`Page ${page}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });

    doc.setTextColor(0);
  }

  function checkPageSpace(requiredHeight) {
    if (y + requiredHeight > pageHeight - 20) {
      addFooter();
      doc.addPage();
      addHeader();
      y = 40;
    }
  }

  addHeader();

  // Score
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");

  doc.text(`Score: ${score}/${questions.length} (${percentage}%)`, margin, y);

  y += 15;

  questions.forEach((q, index) => {
    const userAnswer = userAnswers[index];

    const isCorrect =
      userAnswer &&
      userAnswer.toString().trim().toLowerCase() ===
        q.answer.toString().trim().toLowerCase();

    const isSkipped = !userAnswer;

    const questionLines = doc.splitTextToSize(
      `${index + 1}. ${q.question}`,
      maxWidth,
    );

    const userAnswerLines = doc.splitTextToSize(
      `Your Answer: ${userAnswer || "Not Answered"}`,
      maxWidth - 5,
    );

    const correctAnswerLines = doc.splitTextToSize(
      `Correct Answer: ${q.answer}`,
      maxWidth - 5,
    );

    const estimatedHeight =
      questionLines.length * 7 +
      userAnswerLines.length * 6 +
      correctAnswerLines.length * 6 +
      20;

    checkPageSpace(estimatedHeight);

    // Question
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");

    doc.text(questionLines, margin, y);

    y += questionLines.length * 7 + 3;

    // Your answer
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    if (isCorrect) {
      doc.setTextColor(0, 128, 0);
    } else if (isSkipped) {
      doc.setTextColor(100, 100, 100);
    } else {
      doc.setTextColor(200, 0, 0);
    }

    doc.text(userAnswerLines, margin + 5, y);

    y += userAnswerLines.length * 6;

    // Correct answer
    doc.setTextColor(0, 128, 0);
    doc.setFont(undefined, "bold");

    doc.text(correctAnswerLines, margin + 5, y);

    y += correctAnswerLines.length * 6;

    // Result
    doc.setFontSize(10);

    if (isCorrect) {
      doc.setTextColor(0, 128, 0);
      doc.text("Result: Correct", margin + 5, y);
    } else if (isSkipped) {
      doc.setTextColor(100, 100, 100);
      doc.text("Result: Skipped", margin + 5, y);
    } else {
      doc.setTextColor(200, 0, 0);
      doc.text("Result: Wrong", margin + 5, y);
    }

    doc.setTextColor(0);

    y += 12;
  });

  addFooter();

  return doc;
}
