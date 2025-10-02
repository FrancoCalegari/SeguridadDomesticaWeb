// index.js
const multer = require("multer");
const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware para body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configurar EJS como motor de plantillas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// === Storage de archivos ===
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "public", "uploads")); // carpeta donde se guardan
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });


// Función genérica para leer JSON
// === Helpers JSON ===
function loadJSON(file) {
  try {
    const data = fs.readFileSync(path.join(__dirname, "public", "data", file), "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error leyendo", file, err);
    return [];
  }
}

function saveJSON(file, data) {
  fs.writeFileSync(path.join(__dirname, "public", "data", file), JSON.stringify(data, null, 2));
}


// Configurar sesión
app.use(session({
  secret: "mi-clave-secreta",
  resave: false,
  saveUninitialized: false
}));

// Middleware de protección
function isAuth(req, res, next) {
  if (req.session.user) return next();
  res.redirect("/login");
}

// LOGIN
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

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

// ===============================
// ADMIN DASHBOARD
// ===============================
app.get("/admin", isAuth, (req, res) => {
  const productos = loadJSON("products.json");
  const servicios = loadJSON("services.json");
  const testimonios = loadJSON("testimonials.json");
  const galeria = loadJSON("gallery.json");
  res.render("admin", { productos, servicios, testimonios, galeria });
});

// ===============================
// CRUD PRODUCTOS
// ===============================
app.post("/admin/add", isAuth, (req, res) => {
  let productos = loadJSON("products.json");
  const nuevo = {
    id: Date.now(),
    name: req.body.name,
    description: req.body.description,
    imageUrl: req.body.imageUrl
  };
  productos.push(nuevo);
  saveJSON("products.json", productos);
  res.redirect("/admin");
});

app.post("/admin/edit/:id", isAuth, (req, res) => {
  let productos = loadJSON("products.json");
  productos = productos.map(p =>
    p.id == req.params.id
      ? { ...p, name: req.body.name, description: req.body.description, imageUrl: req.body.imageUrl }
      : p
  );
  saveJSON("products.json", productos);
  res.redirect("/admin");
});

app.post("/admin/delete/:id", isAuth, (req, res) => {
  let productos = loadJSON("products.json");
  productos = productos.filter(p => p.id != req.params.id);
  saveJSON("products.json", productos);
  res.redirect("/admin");
});

// ===============================
// CRUD TESTIMONIOS
// ===============================
app.post("/admin/testimonial/add", isAuth, (req, res) => {
  let testimonios = loadJSON("testimonials.json");
  const nuevo = {
    id: Date.now(),
    name: req.body.name,
    quote: req.body.quote
  };
  testimonios.push(nuevo);
  saveJSON("testimonials.json", testimonios);
  res.redirect("/admin");
});

app.post("/admin/testimonial/edit/:id", isAuth, (req, res) => {
  let testimonios = loadJSON("testimonials.json");
  testimonios = testimonios.map(t =>
    t.id == req.params.id
      ? { ...t, name: req.body.name, quote: req.body.quote }
      : t
  );
  saveJSON("testimonials.json", testimonios);
  res.redirect("/admin");
});

app.post("/admin/testimonial/delete/:id", isAuth, (req, res) => {
  let testimonios = loadJSON("testimonials.json");
  testimonios = testimonios.filter(t => t.id != req.params.id);
  saveJSON("testimonials.json", testimonios);
  res.redirect("/admin");
});

// ===============================
// CRUD GALERIA
// ===============================
app.post("/admin/gallery/add", upload.single("file"), (req, res) => {
  let galeria = loadJSON("gallery.json");

  const newItem = {
    id: Date.now(),
    description: req.body.description,
    fileUrl: "/uploads/" + req.file.filename, // ruta pública
    type: req.file.mimetype.startsWith("image")
      ? "image"
      : req.file.mimetype.startsWith("video")
      ? "video"
      : "audio"
  };

  galeria.push(newItem);
  saveJSON("gallery.json", galeria);

  res.redirect("/admin");
});


// Editar item
app.post("/admin/gallery/edit/:id", upload.single("file"), (req, res) => {
  let galeria = loadJSON("gallery.json");
  const id = parseInt(req.params.id);

  galeria = galeria.map(g => {
    if (g.id === id) {
      g.description = req.body.description || g.description;

      if (req.file) {
        g.fileUrl = "/uploads/" + req.file.filename;
        g.type = req.file.mimetype.startsWith("image")
          ? "image"
          : req.file.mimetype.startsWith("video")
          ? "video"
          : "audio";
      }
    }
    return g;
  });

  saveJSON("gallery.json", galeria);
  res.redirect("/admin");
});

// Eliminar item
app.post("/admin/gallery/delete/:id", (req, res) => {
  let galeria = loadJSON("gallery.json");
  const id = parseInt(req.params.id);

  galeria = galeria.filter(g => g.id !== id);

  saveJSON("gallery.json", galeria);
  res.redirect("/admin");
});

// ===============================
// RUTA PRINCIPAL
// ===============================
app.get("/", (req, res) => {
  const products = loadJSON("products.json");
  const services = loadJSON("services.json");
  const testimonios = loadJSON("testimonials.json");
  const galeria = loadJSON("gallery.json");

  res.render("index", {
    products,
    services,
    testimonials: testimonios,
    galeria
  });
});


app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
