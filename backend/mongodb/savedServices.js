import mongoose from "mongoose";

const savedServicesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["maxquestion", "exampaper", "quiz"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true, // needed to delete from Cloudinary later
    },
  },
  { timestamps: true },
);

export default mongoose.model("SavedServices", savedServicesSchema);