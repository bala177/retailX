const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { BadRequestError } = require("../utils/errors");

// Ensure upload directories exist
const uploadDirs = ["uploads/logos", "uploads/heroes", "uploads/products", "uploads/staff", "uploads/categories", "uploads/about", "uploads/general"];

uploadDirs.forEach((dir) => {
  const fullPath = path.join(__dirname, "../../", dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type || req.query.type || "general";
    const dir = path.join(__dirname, "../../uploads", type);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`Invalid file type: ${file.mimetype}. Allowed: JPEG, PNG, GIF, WebP, SVG`), false);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// Image optimization middleware
const optimizeImage = async (req, res, next) => {
  if (!req.file && !req.files) return next();

  try {
    const files = req.files || [req.file];

    for (const file of files) {
      if (file.mimetype === "image/svg+xml") continue; // Skip SVG

      const optimizedPath = file.path.replace(/\.[^.]+$/, ".webp");

      // Determine dimensions based on upload type
      const type = req.params.type || req.query.type || "general";
      let width, height;

      switch (type) {
        case "logos":
          width = 400;
          height = 400;
          break;
        case "heroes":
          width = 1920;
          height = 600;
          break;
        case "products":
          width = 800;
          height = 800;
          break;
        case "staff":
          width = 400;
          height = 400;
          break;
        case "categories":
          width = 600;
          height = 400;
          break;
        default:
          width = 1200;
          height = 1200;
      }

      await sharp(file.path).resize(width, height, { fit: "cover", withoutEnlargement: true }).webp({ quality: 85 }).toFile(optimizedPath);

      // Remove original, rename optimized
      fs.unlinkSync(file.path);
      file.path = optimizedPath;
      file.filename = path.basename(optimizedPath);
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, optimizeImage };
