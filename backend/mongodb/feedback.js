import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },

    guestName: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    feedbackType: {
      type: String,
      enum: ["MCQ", "ExamPaper", "Quiz", "LongQuestions", "TrueFalse"],
      required: true,
    },

    message: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    generatedContentId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Feedback", feedbackSchema);
