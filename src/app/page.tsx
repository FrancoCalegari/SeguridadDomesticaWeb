import Image from 'next/image';
import { ShieldCheck, Star, Instagram, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SecurityTipsGenerator } from '@/components/security-tips-generator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ContactForm } from '@/components/contact-form';

type Product = {
  name: string;
  description: string;
  image: (typeof PlaceHolderImages)[0];
};

const products: Product[] = [
  {
    name: 'Cámaras de Vigilancia',
    description: 'Monitoreo 24/7 con cámaras HD de última generación. Acceso remoto desde tu smartphone.',
    image: PlaceHolderImages.find(p => p.id === 'product-camera')!,
  },
  {
    name: 'Sistemas de Alarma',
    description: 'Alarmas sonoras y silenciosas conectadas a nuestra central de monitoreo para una respuesta inmediata.',
    image: PlaceHolderImages.find(p => p.id === 'product-alarm')!,
  },
  {
    name: 'Cerraduras Inteligentes',
    description: 'Controla el acceso a tu hogar sin llaves. Otorga permisos temporales y recibe notificaciones.',
    image: PlaceHolderImages.find(p => p.id === 'product-lock')!,
  },
];

type Testimonial = {
  name: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    name: 'Familia Gonzalez',
    quote: 'Desde que instalamos el sistema de SafeHome, nos sentimos mucho más seguros. La atención al cliente es excelente.',
  },
  {
    name: 'Maria Rodriguez',
    quote: 'La instalación fue rápida y profesional. Las cámaras tienen una calidad de imagen increíble, incluso de noche.',
  },
  {
    name: 'Carlos Perez',
    quote: 'Poder controlar todo desde el celular es una maravilla. Recomiendo totalmente sus servicios.',
  },
];

const galleryImages = PlaceHolderImages.filter(p => p.id.startsWith('gallery-'));


export default function Home() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <a className="flex items-center justify-center gap-2" href="#">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg font-headline">SafeHome</span>
        </a>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#products">
            Productos
          </a>
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#testimonials">
            Testimonios
          </a>
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#contact">
            Contacto
          </a>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary/10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                    Seguridad Domiciliaria a tu Alcance
                  </h1>
                  <p className="max-w-[600px] text-foreground/80 md:text-xl">
                    Protege lo que más importa con nuestra tecnología de vanguardia y monitoreo profesional 24/7.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <a href="#contact">
                    <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transition-transform hover:scale-105">Solicitar Presupuesto</Button>
                  </a>
                </div>
              </div>
              <Image
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-2xl"
                data-ai-hint="home security system"
                height="550"
                src="https://picsum.photos/seed/hero/550/550"
                width="550"
              />
            </div>
          </div>
        </section>

        <section id="products" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Nuestros Productos</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Protección Integral para tu Hogar</h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Ofrecemos una gama completa de soluciones de seguridad para adaptarnos a tus necesidades específicas.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 pt-12">
              {products.map((product) => (
                <Card key={product.name} className="overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
                  <CardHeader className="p-0">
                    <Image
                      src={product.image.imageUrl}
                      alt={product.description}
                      data-ai-hint={product.image.imageHint}
                      width={600}
                      height={400}
                      className="rounded-t-lg object-cover aspect-video"
                    />
                  </CardHeader>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold font-headline">{product.name}</h3>
                    <p className="text-foreground/80 mt-2">{product.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="gallery" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Instalaciones Recientes</h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Vea la calidad y el profesionalismo de nuestro trabajo en los hogares de nuestros clientes.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-12">
              {galleryImages.map(image => (
                 <div key={image.id} className="overflow-hidden rounded-lg shadow-md">
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      data-ai-hint={image.imageHint}
                      width={800}
                      height={600}
                      className="aspect-square object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                    />
                 </div>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Lo que dicen nuestros clientes</h2>
              <p className="mx-auto max-w-[600px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                La satisfacción y tranquilidad de nuestros clientes es nuestra mayor prioridad.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 pt-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="text-left bg-background">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-foreground/80 italic">"{testimonial.quote}"</p>
                    <p className="font-semibold mt-4">- {testimonial.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="ai-tool" className="w-full py-12 md:py-24 lg:py-32 bg-primary/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                 <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Consejero de Seguridad</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Consejos de Seguridad por IA</h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Utilice nuestra herramienta de IA para obtener consejos de seguridad actualizados sobre cualquier tema.
                </p>
              </div>
              <div className="w-full max-w-2xl pt-8">
                <SecurityTipsGenerator />
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center gap-8 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Contáctenos</h2>
              <p className="text-foreground/80">
                ¿Tiene alguna pregunta o desea un presupuesto? Complete el formulario y nos pondremos en contacto con usted a la brevedad.
              </p>
              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>San martin sur 7810, Mendoza, Argentina 5505</span>
                </div>
                 <div className="flex items-center gap-3">
                  <Instagram className="h-5 w-5 text-primary" />
                  <a href="#" className="hover:underline">@seguridaddomiciliaria</a>
                </div>
              </div>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-foreground/70">&copy; 2024 Seguridad Domiciliaria. Todos los derechos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a href="#" className="text-xs hover:underline underline-offset-4" aria-label="Instagram">
            <Instagram className="h-5 w-5" />
          </a>
        </nav>
      </footer>
    </div>
  );
}
