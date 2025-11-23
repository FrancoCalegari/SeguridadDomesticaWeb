// index.js
require("dotenv").config();
const multer = require("multer");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI no definida. Agrega la URI en tu .env.");
  process.exit(1);
}
const SESSION_SECRET = process.env.SESSION_SECRET || "mi-clave-secreta";
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "seguridad_domestica";

// Middleware para body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configurar EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// ===========================
// Conexión y modelos MongoDB
// ===========================
async function connectMongo() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB conectado");
  } catch (err) {
    console.error("Error al conectar a MongoDB", err);
    process.exit(1);
  }
}

function addIdTransform(schema) {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
    }
  });
}

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);
addIdTransform(productSchema);
const Product = mongoose.model("Product", productSchema);

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quote: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);
addIdTransform(testimonialSchema);
const Testimonial = mongoose.model("Testimonial", testimonialSchema);

const galleryItemSchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    type: { type: String, enum: ["image", "video", "audio"], required: true },
    publicId: { type: String }
  },
  { timestamps: true }
);
addIdTransform(galleryItemSchema);
const GalleryItem = mongoose.model("GalleryItem", galleryItemSchema);

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);
addIdTransform(serviceSchema);
const Service = mongoose.model("Service", serviceSchema);

const toPlain = doc => {
  if (!doc) return doc;
  const obj = doc.toObject({ virtuals: true });
  obj.id = obj.id || obj._id?.toString();
  delete obj._id;
  delete obj.__v;
  delete obj.publicId;
  return obj;
};

const manyToPlain = docs => docs.map(toPlain);

// ===========================
// Configuración de subida (Cloudinary)
// ===========================
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

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const safeName = `${Date.now()}-${file.originalname}`
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    return {
      folder: CLOUDINARY_FOLDER,
      resource_type: "auto",
      public_id: safeName
    };
  }
});

// 🔹 Filtro de tipos permitidos (incluye .mov)
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime", // ✅ soporte para .mov (iPhone)
    "audio/mpeg",
    "audio/wav",
    "audio/ogg"
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato de archivo no permitido. Usa imágenes, videos o audio compatibles."), false);
  }
};

// Exportación final del middleware de subida
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // ✅ límite opcional: 100 MB
  }
});

const mapMimeToType = mimetype => {
  if (mimetype.startsWith("image")) return "image";
  if (mimetype.startsWith("video")) return "video";
  if (mimetype.startsWith("audio")) return "audio";
  return "image";
};

const mapResourceToType = (resourceType, format = "") => {
  if (resourceType === "image") return "image";
  const lowerFormat = format.toLowerCase();
  const audioFormats = ["mp3", "wav", "ogg", "aac", "m4a"];
  if (resourceType === "video" && audioFormats.includes(lowerFormat)) return "audio";
  if (resourceType === "video") return "video";
  return "image";
};

const destroyCloudinaryAsset = async (publicId, type = "image") => {
  if (!publicId) return;
  const resourceType = type === "image" ? "image" : "video"; // audio se maneja como video en Cloudinary
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
  } catch (err) {
    console.warn(`No se pudo eliminar ${publicId} en Cloudinary: ${err.message}`);
  }
};

// ===========================
// Email contacto
// ===========================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "jsautomatizacionesweb@gmail.com",
    pass: "hdeh wkea tcen mabo"
  }
});

app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: "portonautomatico13@gmail.com",
    subject: `Nuevo mensaje de contacto de ${name}`,
    html: `<p><strong>Nombre:</strong> ${name}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Mensaje:</strong><br>${message}</p>`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Error enviando correo:", err);
      return res.status(500).json({ success: false });
    }
    console.log("Correo enviado:", info.response);
    res.json({ success: true });
  });
});

// ===========================
// Sesión y login
// ===========================
app.set("trust proxy", 1);
const sessionStore = MongoStore.create({
  mongoUrl: MONGODB_URI,
  collectionName: "sessions",
  ttl: 7 * 24 * 60 * 60 // 7 días
});

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  }
}));

const isAjaxRequest = req =>
  req.xhr ||
  req.headers["x-requested-with"] === "XMLHttpRequest" ||
  req.headers.accept?.includes("application/json") ||
  req.headers["content-type"]?.includes("application/json");

function isAuth(req, res, next) {
  if (req.session.user) return next();
  if (isAjaxRequest(req)) {
    return res.status(401).json({ success: false, message: "No autorizado" });
  }
  res.redirect("/login");
}

app.get("/login", (req, res) => res.render("login", { error: null }));

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    req.session.user = username;
    return res.redirect("/admin");
  }
  res.render("login", { error: "Usuario o contraseña incorrectos" });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// ===========================
// ADMIN
// ===========================
app.get("/admin", isAuth, async (req, res) => {
  try {
    const [productos, testimonios, galeria] = await Promise.all([
      Product.find(),
      Testimonial.find(),
      GalleryItem.find()
    ]);
    res.render("admin", {
      productos: manyToPlain(productos),
      testimonios: manyToPlain(testimonios),
      galeria: manyToPlain(galeria)
    });
  } catch (err) {
    console.error("Error cargando admin:", err);
    res.status(500).send("Error cargando panel de administración");
  }
});

// ===========================
// Firmas para subida directa a Cloudinary
// ===========================
app.post("/admin/gallery/sign", isAuth, (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const publicId = req.body?.publicId;
    const paramsToSign = { timestamp, folder: CLOUDINARY_FOLDER };
    if (publicId) paramsToSign.public_id = publicId;

    const signature = cloudinary.utils.api_sign_request(paramsToSign, cloudinary.config().api_secret);

    res.json({
      success: true,
      signature,
      timestamp,
      folder: CLOUDINARY_FOLDER,
      cloudName: cloudinary.config().cloud_name,
      apiKey: cloudinary.config().api_key
    });
  } catch (err) {
    console.error("Error generando firma Cloudinary:", err);
    res.status(500).json({ success: false, message: "No se pudo generar la firma" });
  }
});

// ===========================
// CRUD PRODUCTOS
// ===========================
app.post("/admin/add", isAuth, async (req, res) => {
  try {
    await Product.create({
      name: req.body.name,
      description: req.body.description,
      imageUrl: req.body.imageUrl
    });
    res.redirect("/admin");
  } catch (err) {
    console.error("Error creando producto:", err);
    res.status(500).send("Error al crear producto");
  }
});

app.post("/admin/edit/:id", isAuth, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      description: req.body.description,
      imageUrl: req.body.imageUrl
    });
    res.redirect("/admin");
  } catch (err) {
    console.error("Error editando producto:", err);
    res.status(500).send("Error al editar producto");
  }
});

app.post("/admin/delete/:id", isAuth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (err) {
    console.error("Error eliminando producto:", err);
    res.status(500).send("Error al eliminar producto");
  }
});

// ===========================
// CRUD TESTIMONIOS
// ===========================
app.post("/admin/testimonial/add", isAuth, async (req, res) => {
  try {
    await Testimonial.create({
      name: req.body.name,
      quote: req.body.quote
    });
    res.redirect("/admin");
  } catch (err) {
    console.error("Error creando testimonio:", err);
    res.status(500).send("Error al crear testimonio");
  }
});

app.post("/admin/testimonial/edit/:id", isAuth, async (req, res) => {
  try {
    await Testimonial.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      quote: req.body.quote
    });
    res.redirect("/admin");
  } catch (err) {
    console.error("Error editando testimonio:", err);
    res.status(500).send("Error al editar testimonio");
  }
});

app.post("/admin/testimonial/delete/:id", isAuth, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (err) {
    console.error("Error eliminando testimonio:", err);
    res.status(500).send("Error al eliminar testimonio");
  }
});

// ===========================
// CRUD GALERÍA
// ===========================
// Subida directa desde el cliente (Cloudinary) -> solo guarda en DB
app.post("/admin/gallery/add-direct", isAuth, async (req, res) => {
  try {
    const { fileUrl, description, publicId, resourceType, format, type } = req.body || {};
    if (!fileUrl || !publicId || !description) {
      return res.status(400).json({ success: false, message: "fileUrl, publicId y description son requeridos" });
    }
    const finalType = type || mapResourceToType(resourceType, format);
    const newItem = await GalleryItem.create({
      fileUrl,
      publicId,
      description,
      type: finalType
    });
    res.json({ success: true, message: "Archivo agregado correctamente", item: toPlain(newItem) });
  } catch (err) {
    console.error("Error creando ítem de galería:", err);
    res.status(500).json({ success: false, message: "Error al crear ítem de galería" });
  }
});

// Edición directa (cambia URL/Cloudinary ID opcionalmente)
app.put("/admin/gallery/edit-direct/:id", isAuth, async (req, res) => {
  try {
    const { fileUrl, description, publicId, resourceType, format, type } = req.body || {};
    const current = await GalleryItem.findById(req.params.id);
    if (!current) return res.status(404).json({ success: false, message: "No encontrado" });

    const update = {
      description: description ?? current.description
    };

    if (fileUrl && publicId) {
      update.fileUrl = fileUrl;
      update.publicId = publicId;
      update.type = type || mapResourceToType(resourceType, format);
    }

    const updated = await GalleryItem.findByIdAndUpdate(req.params.id, update, { new: true });

    if (fileUrl && publicId && current.publicId && current.publicId !== publicId) {
      await destroyCloudinaryAsset(current.publicId, current.type);
    }

    res.json({ success: true, message: "Archivo actualizado correctamente", item: toPlain(updated) });
  } catch (err) {
    console.error("Error editando archivo:", err);
    res.status(500).json({ success: false, message: "Error al editar archivo" });
  }
});

// POST - agregar archivo
app.post("/admin/gallery/add", isAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Archivo requerido" });
    }

    const newItem = await GalleryItem.create({
      fileUrl: req.file.path,
      publicId: req.file.filename,
      description: req.body.description,
      type: mapMimeToType(req.file.mimetype)
    });

    res.json({ success: true, message: "Archivo agregado correctamente", item: toPlain(newItem) });
  } catch (err) {
    console.error("Error agregando archivo:", err);
    res.status(500).json({ success: false, message: "Error al agregar archivo" });
  }
});

// PUT - editar archivo
app.put("/admin/gallery/edit/:id", isAuth, upload.single("file"), async (req, res) => {
  try {
    const current = await GalleryItem.findById(req.params.id);
    if (!current) return res.status(404).json({ success: false, message: "No encontrado" });

    const update = {
      description: req.body.description || current.description
    };

    if (req.file) {
      update.fileUrl = req.file.path;
      update.publicId = req.file.filename;
      update.type = mapMimeToType(req.file.mimetype);
    }

    const updated = await GalleryItem.findByIdAndUpdate(req.params.id, update, { new: true });

    if (req.file && current.publicId && current.publicId !== update.publicId) {
      await destroyCloudinaryAsset(current.publicId, current.type);
    }

    res.json({ success: true, message: "Archivo actualizado correctamente", item: toPlain(updated) });
  } catch (err) {
    console.error("Error editando archivo:", err);
    res.status(500).json({ success: false, message: "Error al editar archivo" });
  }
});

app.post("/admin/gallery/delete/:id", isAuth, async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (item?.publicId) {
      await destroyCloudinaryAsset(item.publicId, item.type);
    }
    await GalleryItem.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (err) {
    console.error("Error eliminando archivo:", err);
    res.status(500).send("Error al eliminar archivo");
  }
});

// ===========================
// Página principal
// ===========================
app.get("/", async (req, res) => {
  try {
    const [services, products, testimonios, galeria] = await Promise.all([
      Service.find(),
      Product.find(),
      Testimonial.find(),
      GalleryItem.find()
    ]);

    res.render("index", {
      services: manyToPlain(services),
      products: manyToPlain(products),
      testimonials: manyToPlain(testimonios),
      galeria: manyToPlain(galeria)
    });
  } catch (err) {
    console.error("Error cargando página principal:", err);
    res.status(500).send("Error cargando datos");
  }
});

// ===========================
// Rutas API para refrescar tablas
// ===========================
app.get("/admin/products/list", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(manyToPlain(products));
  } catch (err) {
    console.error("Error listando productos:", err);
    res.status(500).json([]);
  }
});

app.get("/admin/gallery/list", async (req, res) => {
  try {
    const galeria = await GalleryItem.find();
    res.json(manyToPlain(galeria));
  } catch (err) {
    console.error("Error listando galería:", err);
    res.status(500).json([]);
  }
});

app.get("/admin/testimonials/list", async (req, res) => {
  try {
    const testimonios = await Testimonial.find();
    res.json(manyToPlain(testimonios));
  } catch (err) {
    console.error("Error listando testimonios:", err);
    res.status(500).json([]);
  }
});

connectMongo().then(() => {
  app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
});
