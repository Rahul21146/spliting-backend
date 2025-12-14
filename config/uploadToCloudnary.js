const cloudinary = require("cloudinary").v2;

exports.uploadToCloudinary = async (file, folder, quality) => {
  try {
    const options = {
      folder,
      resource_type: "auto",
    };
    if (quality) {
      options.quality = quality;
    }

    const result = await cloudinary.uploader.upload(file.tempFilePath, options);
    return result;
  } catch (error) {
    console.error("Error while uploading to Cloudinary:", error);
    throw new Error("Cloudinary upload failed"); // ✅ Re-throwing the error
  }
};
