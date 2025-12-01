// Migra imágenes de productos (URLs externas) a Cloudinary y actualiza la colección products en MongoDB.
// Requiere variables: CLOUDINARY_URL (o CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET) y MONGODB_URI.

require("dotenv").config();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const MONGODB_URI = process.env.MONGODB_URI;
const CLOUDINARY_FOLDER =
	process.env.CLOUDINARY_FOLDER || "seguridad_domestica";

const hasCloudinaryConfig =
	process.env.CLOUDINARY_URL ||
	(process.env.CLOUDINARY_CLOUD_NAME &&
		process.env.CLOUDINARY_API_KEY &&
		process.env.CLOUDINARY_API_SECRET);

if (!hasCloudinaryConfig) {
	console.error(
		"Configura Cloudinary: CLOUDINARY_URL o CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET"
	);
	process.exit(1);
}

if (process.env.CLOUDINARY_URL) {
	cloudinary.config({ secure: true });
} else {
	cloudinary.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
		secure: true,
	});
}

const productSchema = new mongoose.Schema(
	{
		name: String,
		description: String,
		imageUrl: String,
		publicId: String,
	},
	{ timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

async function main() {
	if (!MONGODB_URI) {
		console.error("MONGODB_URI no definida");
		process.exit(1);
	}

	await mongoose.connect(MONGODB_URI);
	console.log("Conectado a MongoDB");

	// Buscar productos que NO tengan una URL de Cloudinary
	const candidates = await Product.find({
		imageUrl: { $not: /^https:\/\/res\.cloudinary\.com/ },
	});

	console.log(`Encontrados ${candidates.length} productos a migrar`);

	for (const item of candidates) {
		if (!item.imageUrl) continue;

		console.log(`Migrando ${item.name} (${item.imageUrl})...`);

		try {
			// Cloudinary puede subir directamente desde una URL
			const uploadRes = await cloudinary.uploader.upload(item.imageUrl, {
				folder: CLOUDINARY_FOLDER,
				resource_type: "image",
				public_id: `product-${Date.now()}-${item._id}`,
			});

			await Product.findByIdAndUpdate(item._id, {
				imageUrl: uploadRes.secure_url,
				publicId: uploadRes.public_id,
			});

			console.log(`Migrado ${item._id} -> ${uploadRes.secure_url}`);
		} catch (err) {
			console.error(`Error migrando ${item._id}:`, err.message);
		}
	}

	await mongoose.disconnect();
	console.log("Migración finalizada");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
