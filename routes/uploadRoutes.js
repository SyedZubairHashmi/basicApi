const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const upload = require("../middlewares/multer");

// POST /api/upload
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file; // file from frontend

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { folder: "my_project" },
      (error, result) => {
        if (error) return res.status(500).json({ message: error.message });
        res.json({ url: result.secure_url });
      }
    );

    // Pipe file buffer to Cloudinary
    streamifier.createReadStream(file.buffer).pipe(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
