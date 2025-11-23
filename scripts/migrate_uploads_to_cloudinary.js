// Migra archivos locales en public/uploads a Cloudinary y actualiza la colección galleryitems en MongoDB.
// Requiere variables: CLOUDINARY_URL (o CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET) y MONGODB_URI.

require("dotenv").config();
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://vercelAlfredTest:137546321a%40@cluster0.agnkord.mongodb.net/seguridad_domestica?retryWrites=true&w=majority&appName=Cluster0";
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "seguridad_domestica";

const hasCloudinaryConfig =
  process.env.CLOUDINARY_URL ||
  (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

if (!hasCloudinaryConfig) {
  console.error("Configura Cloudinary: CLOUDINARY_URL o CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET");
  process.exit(1);
}

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true }); // usa CLOUDINARY_URL
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

const galleryItemSchema = new mongoose.Schema(
  {
    fileUrl: String,
    description: String,
    type: String,
    publicId: String
  },
  { collection: "galleryitems" }
);

const GalleryItem = mongoose.model("GalleryItem", galleryItemSchema);

const mapResourceType = type => (type === "image" ? "image" : "video");

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Conectado a MongoDB");

  const candidates = await GalleryItem.find({
    $or: [{ publicId: { $exists: false } }, { publicId: null }, { fileUrl: { $regex: "^/uploads/" } }]
  });

  console.log(`Encontrados ${candidates.length} items a migrar`);

  for (const item of candidates) {
    const localPath = path.join(__dirname, "..", "public", item.fileUrl.replace(/^\//, ""));
    if (!fs.existsSync(localPath)) {
      console.warn(`No existe archivo local para ${item.id || item._id}: ${localPath}`);
      continue;
    }

    try {
      const uploadRes = await cloudinary.uploader.upload(localPath, {
        folder: CLOUDINARY_FOLDER,
        resource_type: "auto",
        public_id: `migration-${Date.now()}-${path.basename(localPath)}`
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9._-]/g, "")
      });

      await GalleryItem.findByIdAndUpdate(item._id, {
        fileUrl: uploadRes.secure_url,
        publicId: uploadRes.public_id,
        type: uploadRes.resource_type === "image" ? "image" : item.type || "video"
      });

      console.log(`Migrado ${item._id} -> ${uploadRes.secure_url}`);
    } catch (err) {
      console.error(`Error migrando ${item._id}:`, err);
    }
  }

  await mongoose.disconnect();
  console.log("Migración finalizada");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
