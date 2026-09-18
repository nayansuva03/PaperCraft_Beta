import Feedback from "../mongodb/feedback.js";

export const createFeedback = async (req, res) => {
  console.log("/api/feedback was called.");
  try {
    if (!req.body.email && !req.body.guestName) {
      return res.status(400).json({
        success: false,
        message: "Can't access email or GuestName",
      });
    }

    if (!req.body.message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "message is required",
      });
    }
    
    const {
      name,
      guestName,
      email,
      feedbackType,
      message,
      generatedContentId,
    } = req.body;

    const newFeedback = new Feedback({
      name,
      guestName,
      email,
      feedbackType,
      message,
      generatedContentId,
    });
    const saved = await newFeedback.save();

    res.status(201).json({
      success: true,
      data: saved,
    });
  } catch (error) {
    console.error("Error creating feedback:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getFeedback = async (req, res) => {
  try {
    const allFeedback = await Feedback.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: allFeedback,
    });
  } catch (error) {
    console.error("Error Geting the feedback", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!deletedFeedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully.",
    });
  } catch (error) {
    console.error("Error Deleting the feedback", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
