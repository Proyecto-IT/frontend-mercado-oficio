import Header from "@/components/Header";
import ServiceCategories from "@/components/ServiceCategories";
import ServiceCard from "@/components/ServiceCard";
import carpenterImage from "@/assets/carpenter-worker.jpg";
import mechanicImage from "@/assets/mechanic-worker.jpg";
import plumberImage from "@/assets/plumber-worker.jpg";
import electricianImage from "@/assets/electrician-worker.jpg";

// Mock data for workers
const workers = [
  {
    id: "1",
    name: "Carlos Mendoza",
    service: "Carpintería",
    rating: 4.8,
    reviews: 127,
    hourlyRate: 2500,
    location: "Buenos Aires, CABA",
    availability: "Disponible hoy",
    image: carpenterImage,
    description: "Especialista en muebles a medida, reparaciones de madera y trabajos de carpintería fina. Más de 10 años de experiencia."
  },
  {
    id: "2",
    name: "Miguel Rodriguez",
    service: "Mecánica Automotriz",
    rating: 4.9,
    reviews: 203,
    hourlyRate: 3000,
    location: "Córdoba Capital",
    availability: "Disponible mañana",
    image: mechanicImage,
    description: "Mecánico certificado especializado en diagnóstico y reparación de motores. Atención domiciliaria disponible."
  },
  {
    id: "3",
    name: "Roberto Silva",
    service: "Plomería",
    rating: 4.7,
    reviews: 89,
    hourlyRate: 2200,
    location: "Rosario, Santa Fe",
    availability: "Disponible hoy",
    image: plumberImage,
    description: "Plomero matriculado con experiencia en instalaciones sanitarias, destapes y reparaciones de urgencia 24hs."
  },
  {
    id: "4",
    name: "Juan Pérez",
    service: "Electricista",
    rating: 4.8,
    reviews: 156,
    hourlyRate: 2800,
    location: "La Plata, Buenos Aires",
    availability: "Disponible hoy",
    image: electricianImage,
    description: "Electricista matriculado especializado en instalaciones eléctricas residenciales y comerciales. Trabajos certificados."
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-card-foreground mb-4">
            Encuentra el profesional que necesitas
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Conectamos clientes con trabajadores calificados. Carpinteros, mecánicos, plomeros y más, todos verificados y con reseñas reales.
          </p>
        </section>

        {/* Service Categories */}
        <ServiceCategories />

        {/* Featured Workers */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-card-foreground">
              Profesionales Destacados
            </h2>
            <span className="text-sm text-muted-foreground">
              {workers.length} profesionales disponibles
            </span>
          </div>
          
          <div className="grid gap-6">
            {workers.map((worker) => (
              <ServiceCard key={worker.id} {...worker} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
