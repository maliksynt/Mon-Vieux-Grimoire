const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

const MIMES_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIMES_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();
  const originalImagePath = req.file.path;
  const optimizedImageName = `optimized_${req.file.filename}`;
  const optimizedImagePath = `images/${optimizedImageName}`;
  try {
    await sharp(originalImagePath)
      .resize(300)
      .webp({ quality: 80 })
      .toFile(`${optimizedImagePath}`);

    req.file.path = optimizedImagePath;
    req.file.filename = optimizedImageName;

    fs.unlink(originalImagePath, (error) => {
      if (error) {
        console.error("Impossible de supprimer l'image originale : ", error);
        return next(error);
      }
    });

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload: multer({ storage }).single("image"),
  optimizeImage,
};
