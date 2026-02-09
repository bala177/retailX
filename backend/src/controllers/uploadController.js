const path = require("path");
const fs = require("fs");
const { asyncHandler } = require("../utils/helpers");
const { BadRequestError } = require("../utils/errors");
const logger = require("../utils/logger");

/**
 * Upload a single image
 * POST /api/v1/store/:tenantSlug/upload/:type
 * POST /api/v1/upload/:type
 */
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError("No file uploaded");
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const type = req.params.type || "general";
  const fileUrl = `${baseUrl}/uploads/${type}/${req.file.filename}`;

  logger.info(`Image uploaded: ${type}/${req.file.filename}`);

  res.status(201).json({
    status: "success",
    message: "Image uploaded successfully",
    data: {
      url: fileUrl,
      filename: req.file.filename,
      type,
      size: req.file.size,
    },
  });
});

/**
 * Upload multiple images
 * POST /api/v1/store/:tenantSlug/upload/:type/multiple
 */
const uploadMultipleImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new BadRequestError("No files uploaded");
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const type = req.params.type || "general";

  const images = req.files.map((file) => ({
    url: `${baseUrl}/uploads/${type}/${file.filename}`,
    filename: file.filename,
    type,
    size: file.size,
  }));

  logger.info(`${images.length} images uploaded: ${type}`);

  res.status(201).json({
    status: "success",
    message: `${images.length} images uploaded successfully`,
    data: { images },
  });
});

/**
 * Delete an uploaded image
 * DELETE /api/v1/store/:tenantSlug/upload/:type/:filename
 */
const deleteImage = asyncHandler(async (req, res) => {
  const { type, filename } = req.params;
  const filePath = path.join(__dirname, "../../uploads", type, filename);

  if (!fs.existsSync(filePath)) {
    throw new BadRequestError("File not found");
  }

  fs.unlinkSync(filePath);
  logger.info(`Image deleted: ${type}/${filename}`);

  res.json({
    status: "success",
    message: "Image deleted successfully",
  });
});

module.exports = { uploadImage, uploadMultipleImages, deleteImage };
