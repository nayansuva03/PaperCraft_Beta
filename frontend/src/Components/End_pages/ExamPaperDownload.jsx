import React, { useState } from "react";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import Feedback from "../common/Feedback";
import { saveGeneratedPdf } from "../../Services/saveGeneratedPdf"

function ExamPaperDownload() {
    const generatedContent = useSelector((s) => s.Downloaded_pdf.generatedContent);
    const backgroundImage = useSelector((s) => s.Downloaded_pdf.backgroundImage);
    const instituteLogo = useSelector((s) => s.Downloaded_pdf.instituteLogo);

    const [isDownloading, setIsDownloading] = useState(false);

    /**
     * Parse Gemini response format into normalized structure
     * HANDLES: Objects, Strings, and Mixed question formats
     */
    function parseGeminiResponse() {
        if (!generatedContent) {
            console.warn("❌ No generatedContent in Redux");
            return { header: {}, sections: [] };
        }
        console.log("Redux generatedContent");
        console.log(generatedContent);
        console.log(generatedContent.paperContent);
        // Handle Gemini format: { header, questions: { section_A, section_B, ... }, answers: { section_A, ... } }
        if (generatedContent.header && generatedContent.questions) {
            const header = generatedContent.header;
            const questionsObj = generatedContent.questions;
            const answersObj = generatedContent.answers || {};

            // Normalize header field names
            const normalizedHeader = {
                institute_name: header.institute || header.institute_name || "",
                subject: header.subject || "",
                course_standard: header.course_standard || "",
                time_duration: header.duration || header.time_duration || "",
                total_marks: header.total_marks || "",
                difficulty: header.difficulty || "Medium",
            };

            console.log("✅ Parsed header:", normalizedHeader);

            // Convert sections to normalized format
            const sections = [];
            const sectionMap = {
                section_A: { order: 1, name: "Section A", marks: 1 },
                section_B: { order: 2, name: "Section B", marks: 1 },
                section_C: { order: 3, name: "Section C", marks: 2 },
                section_D: { order: 4, name: "Section D", marks: 5 },
            };

            Object.keys(questionsObj).forEach((sectionKey) => {
                const sectionData = questionsObj[sectionKey];
                if (!sectionData) return;

                const sectionInfo = sectionMap[sectionKey];
                if (!sectionInfo) return;

                // Get questions - can be array of objects or array of strings
                let sectionQuestions = [];
                if (Array.isArray(sectionData.questions)) {
                    sectionQuestions = sectionData.questions;
                }

                console.log(
                    `📋 Section ${sectionKey}: Found ${sectionQuestions.length} questions`
                );

                // Convert all questions to normalized format
                const normalizedQuestions = sectionQuestions.map((q, idx) => {
                    // Handle string format questions (like Section B: "q1: text", Section C, D)
                    if (typeof q === "string") {
                        // Parse "q1: text" or just "text"
                        let questionText = q;
                        if (q.includes(":")) {
                            questionText = q.split(":").slice(1).join(":").trim();
                        }

                        return {
                            id: `${sectionKey}_q${idx + 1}`,
                            question: questionText,
                            options: [],
                            type: getSectionType(sectionKey),
                            marks: sectionInfo.marks,
                        };
                    }

                    // Handle object format questions (like Section A with options)
                    return {
                        id: q.id || `${sectionKey}_q${idx + 1}`,
                        question: q.question || "",
                        options: q.options || [],
                        type: getSectionType(sectionKey),
                        marks: sectionInfo.marks,
                    };
                });

                // Get answers for this section
                const answerData = answersObj[sectionKey] || {};
                const answersList = Array.isArray(answerData.answers)
                    ? answerData.answers
                    : [];

                console.log(
                    `📝 Section ${sectionKey}: Found ${answersList.length} answers`
                );

                sections.push({
                    id: sectionKey,
                    name: sectionInfo.name,
                    title: sectionData.title || "",
                    marks: sectionInfo.marks,
                    questions: normalizedQuestions,
                    answers: answersList,
                });
            });

            // Sort by section order
            sections.sort((a, b) => {
                const orderMap = {
                    "Section A": 1,
                    "Section B": 2,
                    "Section C": 3,
                    "Section D": 4,
                };
                return (orderMap[a.name] || 0) - (orderMap[b.name] || 0);
            });

            console.log("✅ Final parsed data - Total sections:", sections.length);
            const totalQuestions = sections.reduce(
                (sum, s) => sum + s.questions.length,
                0
            );
            const totalAnswers = sections.reduce(
                (sum, s) => sum + s.answers.length,
                0
            );
            console.log(
                `✅ Total Questions: ${totalQuestions}, Total Answers: ${totalAnswers}`
            );

            return {
                header: normalizedHeader,
                sections: sections,
            };
        }

        console.error("❌ Invalid generatedContent format");
        return { header: {}, sections: [] };
    }

    function getSectionType(sectionKey) {
        const typeMap = {
            section_A: "mcq",
            section_B: "true_false",
            section_C: "one_liner",
            section_D: "long_question",
        };
        return typeMap[sectionKey] || "mcq";
    }

    const parsedData = parseGeminiResponse();
    const examData = parsedData.header;
    const sections = parsedData.sections;
    const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);
    const totalAnswers = sections.reduce((sum, s) => sum + s.answers.length, 0);

    /**
     * Add watermark/background image with proper opacity
     */
    function addWatermarkToPage(doc) {
        if (!backgroundImage) return;

        try {
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Set opacity
            const gstate = new doc.GState({ opacity: 0.15 });
            doc.setGState(gstate);

            // Add image centered on page
            doc.addImage(
                backgroundImage,
                "PNG",
                pageWidth / 6,
                pageHeight / 4,
                pageWidth * 0.67,
                pageHeight * 0.6
            );

            // Reset opacity
            const gstate_text = new doc.GState({ opacity: 1 });
            doc.setGState(gstate_text);
        } catch (error) {
            console.error("❌ Error adding watermark:", error);
        }
    }

    /**
     * Add institute logos at top corners
     */
    function addInstituteLogo(doc, pageWidth, y) {
        if (!instituteLogo) return y + 5;

        try {
            const logoSize = 20;
            const xMargin = 15;

            // Left logo
            doc.addImage(instituteLogo, "PNG", xMargin, y, logoSize, logoSize);

            // Right logo
            doc.addImage(
                instituteLogo,
                "PNG",
                pageWidth - xMargin - logoSize,
                y,
                logoSize,
                logoSize
            );

            return y + logoSize + 5;
        } catch (error) {
            console.warn("⚠️ Could not add institute logo:", error);
            return y + 5;
        }
    }

    /**
     * Add professional header section
     */
    function addHeader(doc, examData) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        let y = 10;

        // Add logos
        y = addInstituteLogo(doc, pageWidth, y);

        // Institute Name (centered, large, bold)
        doc.setFontSize(20);
        doc.setFont(undefined, "bold");
        doc.setTextColor(20, 20, 60);

        if (examData.institute_name) {
            doc.text(String(examData.institute_name), pageWidth / 2, y, {
                align: "center",
            });
        }
        y += 10;

        // Horizontal line
        doc.setDrawColor(20, 20, 60);
        doc.setLineWidth(1);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        // Course/Subject on LEFT, Marks/Time on RIGHT
        doc.setFontSize(11);
        doc.setFont(undefined, "normal");
        doc.setTextColor(0, 0, 0);

        const leftCol = margin;
        const rightCol = pageWidth - margin - 50;

        // Left side
        if (examData.course_standard) {
            doc.text(`Course : ${examData.course_standard}`, leftCol, y);
        }

        // Right side - Marks
        if (examData.total_marks) {
            doc.text(`Marks : ${examData.total_marks}`, rightCol, y, {
                align: "right",
            });
        }
        y += 7;

        // Subject on left
        if (examData.subject) {
            doc.setFont(undefined, "bold");
            doc.text(`Subject : ${examData.subject}`, leftCol, y);
            doc.setFont(undefined, "normal");
        }

        // Time on right
        if (examData.time_duration) {
            doc.text(`Time : ${examData.time_duration}`, rightCol, y, {
                align: "right",
            });
        }
        y += 8;

        // Horizontal line separator
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.8);
        doc.line(margin, y, pageWidth - margin, y);

        return y + 8;
    }

    /**
     * Add section header with marks info
     */
    function addSectionHeader(doc, section, y) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;

        doc.setFontSize(13);
        doc.setFont(undefined, "bold");
        doc.setTextColor(20, 20, 60);

        const questionCount = section.questions.length;
        const sectionMarks = section.marks * questionCount;

        const text = `${section.name} - ${section.title} (${questionCount} × ${section.marks} = ${sectionMarks} Marks)`;
        doc.text(text, margin, y);

        y += 6;

        // Line under section
        doc.setDrawColor(100, 100, 150);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);

        return y + 6;
    }

    /**
     * Add a question to PDF
     */
    function addQuestion(doc, section, question, questionNumber, y, pageWidth) {
        const margin = 15;
        const maxWidth = pageWidth - 2 * margin;
        const lineHeight = 5;
        let currentY = y;

        doc.setFontSize(11);
        doc.setFont(undefined, "normal");
        doc.setTextColor(0, 0, 0);

        // Question text
        const questionText = `${questionNumber}. ${question.question}`;
        const splits = doc.splitTextToSize(questionText, maxWidth);

        doc.text(splits, margin, currentY);
        currentY += splits.length * lineHeight + 2;

        // Options (for MCQ only)
        if (
            section.type === "mcq" &&
            question.options &&
            question.options.length > 0
        ) {
            doc.setFontSize(10);
            question.options.forEach((option) => {
                const optionText = typeof option === "string" ? option : String(option);
                const optionSplits = doc.splitTextToSize(
                    `   ${optionText}`,
                    maxWidth - 10
                );
                doc.text(optionSplits, margin + 5, currentY);
                currentY += optionSplits.length * lineHeight;
            });
            currentY += 2;
        }

        return currentY;
    }

    /**
     * Check if we need a new page
     */
    function needsNewPage(doc, currentY, threshold = 250) {
        return currentY > threshold;
    }

    /**
     * Generate Exam Paper PDF
     */
    async function generateExamPaperPDF() {
        try {
            setIsDownloading(true);

            if (sections.length === 0) {
                alert("❌ No questions found. Please check your data.");
                setIsDownloading(false);
                return;
            }

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            let currentY = 10;

            addWatermarkToPage(doc);

            // Add header
            currentY = addHeader(doc, examData);

            // Add sections
            sections.forEach((section) => {
                // Check page break before section
                if (needsNewPage(doc, currentY, 240)) {
                    doc.addPage();
                    currentY = margin + 10;
                    addWatermarkToPage(doc);
                }

                // Section header
                currentY = addSectionHeader(doc, section, currentY);

                // Add questions in this section
                section.questions.forEach((question, qIdx) => {
                    if (needsNewPage(doc, currentY, 250)) {
                        doc.addPage();
                        currentY = margin + 10;
                        addWatermarkToPage(doc);
                    }

                    currentY = addQuestion(
                        doc,
                        section,
                        question,
                        qIdx + 1,
                        currentY,
                        pageWidth
                    );
                    currentY += 3;
                });

                currentY += 8;
            });

            // Add footer with page numbers
            const totalPages = doc.internal.pages.length - 1;
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text(
                    `Page ${i} of ${totalPages}`,
                    pageWidth - margin - 20,
                    pageHeight - 10
                );
                doc.text("Confidential", margin, pageHeight - 10);
            }

            // Save PDF
            const fileName = `${examData.subject || "exam"}-paper.pdf`;
            doc.save(fileName);
            saveGeneratedPdf(doc, "exampaper", examTitle);
            console.log("✅ Exam paper PDF generated successfully");

        } catch (error) {
            console.error("❌ Error generating exam paper:", error);
            alert("❌ Failed to download exam paper. Check console for details.");
        } finally {
            setIsDownloading(false);
        }
    }

    /**
     * Generate Answer Sheet PDF
     */
    async function generateAnswerSheetPDF() {
        try {
            setIsDownloading(true);

            if (sections.length === 0 || totalAnswers === 0) {
                alert("❌ No answers found. Please check your data.");
                setIsDownloading(false);
                return;
            }

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            let currentY = 10;

            addWatermarkToPage(doc);

            // Header
            currentY = addHeader(doc, examData);

            // Title
            doc.setFontSize(16);
            doc.setFont(undefined, "bold");
            doc.setTextColor(20, 20, 60);
            doc.text("ANSWER KEY", pageWidth / 2, currentY, { align: "center" });
            currentY += 12;

            // Add answers for each section
            sections.forEach((section) => {
                if (section.answers.length === 0) return;

                if (needsNewPage(doc, currentY, 240)) {
                    doc.addPage();
                    currentY = margin + 10;
                    addWatermarkToPage(doc);
                }

                // Section header
                doc.setFontSize(12);
                doc.setFont(undefined, "bold");
                doc.setTextColor(20, 20, 60);
                doc.text(`${section.name}`, margin, currentY);
                currentY += 8;

                // Answers
                doc.setFontSize(10);
                doc.setFont(undefined, "normal");
                doc.setTextColor(0, 0, 0);

                section.answers.forEach((answer) => {
                    if (needsNewPage(doc, currentY, 260)) {
                        doc.addPage();
                        currentY = margin + 10;
                        addWatermarkToPage(doc);
                    }

                    const answerText = typeof answer === "string" ? answer : String(answer);
                    const maxWidth = pageWidth - 2 * margin - 10;
                    const splits = doc.splitTextToSize(answerText, maxWidth);

                    doc.text(splits, margin + 5, currentY);
                    currentY += splits.length * 5 + 3;
                });

                currentY += 8;
            });

            // Add page numbers
            const totalPages = doc.internal.pages.length - 1;
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text(
                    `Page ${i} of ${totalPages}`,
                    pageWidth - margin - 20,
                    pageHeight - 10
                );
                doc.text(
                    `Confidential - Answer Key`,
                    margin,
                    pageHeight - 10
                );
            }

            // Save PDF
            const fileName = `${examData.subject || "exam"}-answer-key.pdf`;
            doc.save(fileName);

            console.log("✅ Answer sheet PDF generated successfully");

        } catch (error) {
            console.error("❌ Error generating answer sheet:", error);
            alert("❌ Failed to download answer sheet. Check console for details.");
        } finally {
            setIsDownloading(false);
        }
    }

    // ==================== RENDER UI ====================

    if (!generatedContent) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl shadow-xl max-w-md mx-auto text-center transition-colors duration-300">
                <h1 className="text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">⚠️ No Data</h1>
                <p className="text-slate-600 dark:text-slate-400">
                    No exam paper data available to download.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl shadow-xl max-w-2xl mx-auto transition-colors duration-300">
            {/* Main Title */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2 text-indigo-600 dark:text-indigo-400">
                    📄 Exam Paper Ready
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Your exam paper is ready to download
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-lg text-center border border-blue-200 dark:border-blue-800/60">
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Questions</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {totalQuestions}
                    </p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/40 p-4 rounded-lg text-center border border-green-200 dark:border-green-800/60">
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Total Marks</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {examData.total_marks || 0}
                    </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-lg text-center border border-purple-200 dark:border-purple-800/60">
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Answers</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {totalAnswers}
                    </p>
                </div>
            </div>

            {/* Exam Details */}
            {(examData.institute_name || examData.subject) && (
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-slate-800/80 p-5 rounded-2xl mb-8 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3">
                        📋 Exam Details
                    </h3>
                    <div className="space-y-2 text-sm">
                        {examData.institute_name && (
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Institute:</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {examData.institute_name}
                                </span>
                            </div>
                        )}
                        {examData.subject && (
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Subject:</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {examData.subject}
                                </span>
                            </div>
                        )}
                        {examData.course_standard && (
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Course:</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {examData.course_standard}
                                </span>
                            </div>
                        )}
                        {examData.time_duration && (
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Duration:</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {examData.time_duration}
                                </span>
                            </div>
                        )}
                        {examData.difficulty && (
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Difficulty:</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {examData.difficulty}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Download Buttons */}
            <div className="space-y-3 mb-6">
                {/* Exam Paper Download */}
                <button
                    onClick={generateExamPaperPDF}
                    disabled={isDownloading || totalQuestions === 0}
                    className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 ${isDownloading || totalQuestions === 0
                        ? "bg-slate-400 dark:bg-slate-700 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-lg hover:shadow-xl active:scale-[0.99]"
                        }`}
                >
                    {isDownloading ? (
                        <>
                            <svg
                                className="w-5 h-5 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Generating...
                        </>
                    ) : totalQuestions === 0 ? (
                        <>
                            <span>📥 Download Exam Paper</span>
                            <span className="text-sm">(No Questions)</span>
                        </>
                    ) : (
                        <>
                            <span>📥 Download Exam Paper</span>
                            <span className="text-sm">({totalQuestions} Questions)</span>
                        </>
                    )}
                </button>

                {/* Answer Sheet Download */}
                <button
                    onClick={generateAnswerSheetPDF}
                    disabled={isDownloading || totalAnswers === 0}
                    className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 ${isDownloading || totalAnswers === 0
                        ? "bg-slate-400 dark:bg-slate-700 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-lg hover:shadow-xl active:scale-[0.99]"
                        }`}
                >
                    {isDownloading ? (
                        <>
                            <svg
                                className="w-5 h-5 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Generating...
                        </>
                    ) : totalAnswers === 0 ? (
                        <>
                            <span>🔐 Answer Sheet</span>
                            <span className="text-sm">
                                (No Answers Available)
                            </span>
                        </>
                    ) : (
                        <>
                            <span>🔐 Download Answer Sheet</span>
                            <span className="text-sm">
                                ({totalAnswers} Answers)
                            </span>
                        </>
                    )}
                </button>
            </div>
            <Feedback feedbackType="ExamPaper" />
        </div>
    );
}

export default ExamPaperDownload;