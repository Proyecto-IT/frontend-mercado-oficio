import { useParams, Link } from "react-router-dom";
import { Star, MapPin, Clock, ArrowLeft, Award, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import ServiceBooking from "@/components/ServiceBooking";
import Reviews from "@/components/Reviews";
import carpenterImage from "@/assets/carpenter-worker.jpg";
import mechanicImage from "@/assets/mechanic-worker.jpg";
import plumberImage from "@/assets/plumber-worker.jpg";
import electricianImage from "@/assets/electrician-worker.jpg";

// Mock data for workers (same as Index.tsx)
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
    description: "Especialista en muebles a medida, reparaciones de madera y trabajos de carpintería fina. Más de 10 años de experiencia.",
    experience: "10 años",
    completedJobs: 240,
    responseTime: "2 horas",
    portfolio: [
      { title: "Cocina a medida", description: "Instalación completa de cocina en madera de roble" },
      { title: "Muebles de dormitorio", description: "Placard empotrado con diseño moderno" },
      { title: "Estantería biblioteca", description: "Estantería de pino con acabado natural" }
    ],
    skills: ["Muebles a medida", "Reparaciones", "Instalaciones", "Barnizado"],
    verified: true
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
    description: "Mecánico certificado especializado en diagnóstico y reparación de motores. Atención domiciliaria disponible.",
    experience: "15 años",
    completedJobs: 350,
    responseTime: "1 hora",
    portfolio: [
      { title: "Reparación de motor", description: "Overhaul completo de motor V8" },
      { title: "Sistema de frenos", description: "Cambio completo de sistema de frenos ABS" },
      { title: "Diagnóstico computarizado", description: "Diagnóstico y reparación de fallas eléctricas" }
    ],
    skills: ["Diagnóstico", "Motores", "Transmisión", "Frenos"],
    verified: true
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
    description: "Plomero matriculado con experiencia en instalaciones sanitarias, destapes y reparaciones de urgencia 24hs.",
    experience: "8 años",
    completedJobs: 180,
    responseTime: "30 minutos",
    portfolio: [
      { title: "Instalación sanitaria", description: "Instalación completa de baño principal" },
      { title: "Reparación de cañería", description: "Cambio de cañería principal en edificio" },
      { title: "Destape urgencia", description: "Destape de cañería principal 24hs" }
    ],
    skills: ["Instalaciones", "Destapes", "Reparaciones", "Gas"],
    verified: true
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
    description: "Electricista matriculado especializado en instalaciones eléctricas residenciales y comerciales. Trabajos certificados.",
    experience: "12 años",
    completedJobs: 290,
    responseTime: "1 hora",
    portfolio: [
      { title: "Instalación eléctrica", description: "Instalación completa en casa de 3 plantas" },
      { title: "Tablero eléctrico", description: "Cambio y actualización de tablero principal" },
      { title: "Automatización", description: "Sistema domótico básico con sensores" }
    ],
    skills: ["Instalaciones", "Reparaciones", "Automatización", "Certificaciones"],
    verified: true
  }
];

const WorkerProfile = () => {
  const { id } = useParams();
  const worker = workers.find(w => w.id === id);

  if (!worker) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Trabajador no encontrado</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a resultados
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Worker Header */}
            <Card className="bg-serviceCard">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={worker.image}
                      alt={worker.name}
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-card-foreground mb-2">
                          {worker.name}
                        </h1>
                        <p className="text-lg text-primary font-medium mb-3">{worker.service}</p>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            <span className="font-semibold">{worker.rating}</span>
                            <span className="text-muted-foreground">({worker.reviews} reseñas)</span>
                          </div>
                          {worker.verified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Shield className="w-3 h-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{worker.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{worker.availability}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            <span>{worker.experience} de experiencia</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{worker.completedJobs} trabajos completados</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-card-foreground">{worker.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="bg-serviceCard">
              <CardHeader>
                <CardTitle className="text-lg">Especialidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio */}
            <Card className="bg-serviceCard">
              <CardHeader>
                <CardTitle className="text-lg">Portafolio de Trabajos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {worker.portfolio.map((project, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold text-card-foreground mb-1">
                        {project.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {project.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Reviews 
              workerId={worker.id}
              workerName={worker.name}
              averageRating={worker.rating}
              totalReviews={worker.reviews}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="bg-serviceCard sticky top-6">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-card-foreground mb-1">
                    ${worker.hourlyRate}
                  </div>
                  <div className="text-muted-foreground">por hora</div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tiempo de respuesta:</span>
                    <span className="font-medium">{worker.responseTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Trabajos completados:</span>
                    <span className="font-medium">{worker.completedJobs}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Disponibilidad:</span>
                    <span className="font-medium text-green-600">{worker.availability}</span>
                  </div>
                </div>

                <ServiceBooking 
                  workerId={worker.id}
                  workerName={worker.name}
                  serviceName={worker.service}
                  hourlyRate={worker.hourlyRate}
                />
              </CardContent>
            </Card>

            {/* Quick Info Card */}
            <Card className="bg-serviceCard">
              <CardHeader>
                <CardTitle className="text-lg">Información Rápida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Experiencia:</span>
                  <span className="font-medium">{worker.experience}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Calificación:</span>
                  <span className="font-medium">{worker.rating}⭐</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ubicación:</span>
                  <span className="font-medium">{worker.location}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkerProfile;