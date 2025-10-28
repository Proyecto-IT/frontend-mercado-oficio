// src/pages/WorkerProfile.tsx
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Star, MapPin, Clock, ArrowLeft, Award, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import ServiceBooking from "@/components/ServiceBooking";
import Reviews from "@/components/Reviews";
import { servicioService } from "@/services/servicioService";
import { ServicioResponse } from "@/types/servicio.types";
import { formatearTarifa } from "@/utils/validation";
import { useToast } from "@/hooks/use-toast";

const WorkerProfile = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [servicio, setServicio] = useState<ServicioResponse | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarServicio();
  }, [id]);

  const cargarServicio = async () => {
    if (!id) return;
    
    try {
      setCargando(true);
      const data = await servicioService.obtenerPorId(parseInt(id));
      setServicio(data);
    } catch (err) {
      console.error("Error al cargar servicio:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar el servicio"
      });
    } finally {
      setCargando(false);
    }
  };

  const obtenerDisponibilidad = (disponibilidad: { [dia: string]: string }) => {
    const diasActivos = Object.keys(disponibilidad);
    if (diasActivos.length === 0) return "No disponible";
    if (diasActivos.length === 7) return "Disponible todos los días";
    return `Disponible ${diasActivos.length} días`;
  };

  // 🔥 NUEVO: Función para obtener la URL de la imagen
  const obtenerImagenUrl = (servicio: ServicioResponse): string | null => {
    if (!servicio.imagenUsuario || !servicio.imagenUsuarioTipo) {
      return null;
    }
    return `data:${servicio.imagenUsuarioTipo};base64,${servicio.imagenUsuario}`;
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando servicio...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!servicio) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">Servicio no encontrado</h3>
              <p className="text-muted-foreground mb-4">
                El servicio que buscas no existe o fue eliminado
              </p>
              <Link to="/">
                <Button>Volver al inicio</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const imagenUrl = obtenerImagenUrl(servicio); // 🔥 NUEVO

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
                    {imagenUrl ? (
                      <img
                        src={imagenUrl}
                        alt={`${servicio.nombreTrabajador} ${servicio.apellidoTrabajador}`}
                        className="w-32 h-32 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground">
                        {servicio.nombreTrabajador?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-card-foreground mb-2">
                          {servicio.nombreTrabajador} {servicio.apellidoTrabajador}
                        </h1>
                        <p className="text-lg text-primary font-medium mb-3">{servicio.nombreOficio}</p>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            <span className="font-semibold">
                              {servicio.trabajosCompletados > 0 ? "4.8" : "Nuevo"}
                            </span>
                            <span className="text-muted-foreground">
                              ({servicio.trabajosCompletados} trabajos)
                            </span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Shield className="w-3 h-3 mr-1" />
                            Verificado
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{servicio.ubicacion}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{obtenerDisponibilidad(servicio.disponibilidad)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            <span>{servicio.experiencia} años de experiencia</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{servicio.trabajosCompletados} trabajos completados</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {servicio.descripcion && (
                      <p className="text-card-foreground">{servicio.descripcion}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            {servicio.especialidades.length > 0 && (
              <Card className="bg-serviceCard">
                <CardHeader>
                  <CardTitle className="text-lg">Especialidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {servicio.especialidades.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Portfolio */}
            {servicio.portafolios.length > 0 && (
              <Card className="bg-serviceCard">
                <CardHeader>
                  <CardTitle className="text-lg">Portafolio de Trabajos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {servicio.portafolios.map((proyecto, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <h4 className="font-semibold text-card-foreground mb-1">
                          {proyecto.titulo}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {proyecto.descripcion}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Reviews 
              workerId={servicio.id.toString()}
              workerName={`${servicio.nombreTrabajador} ${servicio.apellidoTrabajador}`}
              averageRating={servicio.trabajosCompletados > 0 ? 4.8 : 0}
              totalReviews={servicio.trabajosCompletados}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="bg-serviceCard sticky top-6">
              <CardContent className="p-6">
                {servicio.tarifaHora && (
                  <>
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-card-foreground mb-1">
                        {formatearTarifa(servicio.tarifaHora)}
                      </div>
                      <div className="text-muted-foreground">por hora</div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tiempo de respuesta:</span>
                        <span className="font-medium">2 horas</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Trabajos completados:</span>
                        <span className="font-medium">{servicio.trabajosCompletados}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Disponibilidad:</span>
                        <span className="font-medium text-green-600">
                          {obtenerDisponibilidad(servicio.disponibilidad)}
                        </span>
                      </div>
                    </div>

                    <ServiceBooking 
                      servicioId={servicio.id.toString()}
                      workerId={servicio.id.toString()} // <-- agregado
                      workerName={`${servicio.nombreTrabajador} ${servicio.apellidoTrabajador}`}
                      serviceName={servicio.nombreOficio}
                      hourlyRate={servicio.tarifaHora}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkerProfile;