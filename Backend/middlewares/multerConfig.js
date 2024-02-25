const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

// Définition des types MIME pour la correspondance avec les extensions de fichier.
const MIMES_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Configuration du stockage des fichiers : définit le dossier de destination et le nom du fichier.
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

// Middleware pour optimiser l'image téléchargée en format WebP et redimensionner.
const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();
  const originalImagePath = req.file.path;
  const optimizedImageName = `optimized_${req.file.filename}`;
  const optimizedImagePath = `images/${optimizedImageName}`;
  try {
    await sharp(originalImagePath)
      .webp({ quality: 80 })
      .resize(400)
      .toFile(`${optimizedImagePath}`);

    req.file.path = optimizedImagePath;
    req.file.filename = optimizedImageName;

    // Supprime l'image originale après optimisation.
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

// Exporte les fonctionnalités de téléchargement et d'optimisation d'image.
module.exports = {
  upload: multer({ storage }).single("image"),
  optimizeImage,
};
