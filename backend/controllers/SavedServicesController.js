import cloudinary from "../config/cloudinary.js";
import savedServices from "../mongodb/savedServices.js";


// POST /api/saved-pdfs
export const savePdf = async (req, res) => {
  console.log("savePdf was called");
  
  try {
    const { type, title } = req.body;
    if (!req.file)
      return res.status(400).json({ message: "No PDF file provided" });
    if (!["maxquestion", "exampaper", "quiz"].includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }

    // Upload buffer to Cloudinary as a raw file
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: `papercraft/${req.user.id}`,
          public_id: `${type}_${Date.now()}`,
          format: "pdf",
        },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        },
      );

      stream.end(req.file.buffer);
    });

    const saved = await savedServices.create({
      user: req.user.id,
      type,
      title: title || "Untitled",
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error("savePdf error:", err);
    res.status(500).json({ message: "Failed to save PDF" });
  }
};

// GET /api/saved-pdfs
export const getsavedServicess = async (req, res) => {
  try {
    const pdfs = await savedServices
      .find({
        user: req.user.id,
      })
      .sort({
        createdAt: -1,
      });
    res.json(pdfs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch saved PDFs" });
  }
};

// DELETE /api/saved-pdfs/:id
export const deletesavedServices = async (req, res) => {
  try {
    const pdf = await savedServices.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!pdf) return res.status(404).json({ message: "Not found" });

    await cloudinary.uploader.destroy(pdf.cloudinaryPublicId, {
      resource_type: "image",
    });
    await pdf.deleteOne();

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete PDF" });
  }
};