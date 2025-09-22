const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Datos simulados (los mismos que usabas en TSX)
const products = [
  {
    name: 'Cámaras de Vigilancia',
    description: 'Monitoreo 24/7 con cámaras HD de última generación. Acceso remoto desde tu smartphone.',
    image: { imageUrl: 'https://thumbs.dreamstime.com/b/c%C3%A1mara-de-seguridad-moderna-instalada-fuera-un-hogar-elegante-sistema-vigilancia-protecci%C3%B3n-domiciliaria-concepto-residencial-386923288.jpg', imageHint: 'camera' }
  },
  {
    name: 'Sistemas de Alarma',
    description: 'Alarmas sonoras y silenciosas conectadas a nuestra central de monitoreo para una respuesta inmediata.',
    image: { imageUrl: 'https://officialpress.es/wp-content/uploads/2022/06/alarma.jpg', imageHint: 'alarm' }
  },
  {
    name: 'Cerraduras Inteligentes',
    description: 'Controla el acceso a tu hogar sin llaves. Otorga permisos temporales y recibe notificaciones.',
    image: { imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTM_xp27weikpZsgLUX-EwGmkYHa8m-bTd0-Q&s', imageHint: 'lock' }
  },
];

const testimonials = [
  { name: 'Familia Gonzalez', quote: 'Desde que instalamos el sistema de SafeHome, nos sentimos mucho más seguros. La atención al cliente es excelente.' },
  { name: 'Maria Rodriguez', quote: 'La instalación fue rápida y profesional. Las cámaras tienen una calidad de imagen increíble, incluso de noche.' },
  { name: 'Carlos Perez', quote: 'Poder controlar todo desde el celular es una maravilla. Recomiendo totalmente sus servicios.' },
];

const galleryImages = [
  { id: 'gallery-1', imageUrl: 'https://picsum.photos/seed/gallery1/800/600', description: 'Instalación 1' },
  { id: 'gallery-2', imageUrl: 'https://picsum.photos/seed/gallery2/800/600', description: 'Instalación 2' },
  { id: 'gallery-3', imageUrl: 'https://picsum.photos/seed/gallery3/800/600', description: 'Instalación 3' },
  { id: 'gallery-4', imageUrl: 'https://picsum.photos/seed/gallery4/800/600', description: 'Instalación 4' },
];

// Ruta principal
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Inicio',
    products,
    testimonials,
    galleryImages
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
