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

// Función genérica para leer JSON
function loadJSON(file) {
  const data = fs.readFileSync(path.join(__dirname, "public", "data", file), "utf-8");
  return JSON.parse(data);
}

// Datos fijos (testimonios y galería)
const testimonials = [
  { name: "Familia Gonzalez", quote: "Desde que instalamos el sistema de SafeHome, nos sentimos mucho más seguros." },
  { name: "Maria Rodriguez", quote: "La instalación fue rápida y profesional. Las cámaras tienen una calidad de imagen increíble." },
  { name: "Carlos Perez", quote: "Poder controlar todo desde el celular es una maravilla. Recomiendo totalmente." }
];

const galleryImages = [
  { id: "gallery-1", imageUrl: "https://picsum.photos/seed/gallery1/800/600", description: "Instalación 1" },
  { id: "gallery-2", imageUrl: "https://picsum.photos/seed/gallery2/800/600", description: "Instalación 2" },
  { id: "gallery-3", imageUrl: "https://picsum.photos/seed/gallery3/800/600", description: "Instalación 3" },
  { id: "gallery-4", imageUrl: "https://picsum.photos/seed/gallery4/800/600", description: "Instalación 4" }
];

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

// ADMIN CRUD
app.get("/admin", isAuth, (req, res) => {
  const productos = loadJSON("products.json");
  res.render("admin", { productos });
});

// Crear producto
app.post("/admin/add", isAuth, (req, res) => {
  let productos = loadJSON("products.json");
  const nuevo = {
    id: Date.now(),
    name: req.body.name,
    description: req.body.description,
    imageUrl: req.body.imageUrl
  };
  productos.push(nuevo);
  fs.writeFileSync(path.join(__dirname, "public", "data", "products.json"), JSON.stringify(productos, null, 2));
  res.redirect("/admin");
});

// Editar producto
app.post("/admin/edit/:id", isAuth, (req, res) => {
  let productos = loadJSON("products.json");
  productos = productos.map(p =>
    p.id == req.params.id
      ? { ...p, name: req.body.name, description: req.body.description, imageUrl: req.body.imageUrl }
      : p
  );
  fs.writeFileSync(path.join(__dirname, "public", "data", "products.json"), JSON.stringify(productos, null, 2));
  res.redirect("/admin");
});

// Eliminar producto
app.post("/admin/delete/:id", isAuth, (req, res) => {
  let productos = loadJSON("products.json");
  productos = productos.filter(p => p.id != req.params.id);
  fs.writeFileSync(path.join(__dirname, "public", "data", "products.json"), JSON.stringify(productos, null, 2));
  res.redirect("/admin");
});

// Ruta principal (index)
app.get("/", (req, res) => {
  const products = loadJSON("products.json");
  const services = loadJSON("services.json"); // 👈 nuevo
  res.render("index", { title: "Inicio", products, services, testimonials, galleryImages });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
