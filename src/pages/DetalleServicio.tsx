import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Briefcase, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";
import { servicioService } from "@/services/servicioService";
import { ServicioResponse } from "@/types/servicio.types";
import { formatearTarifa, diasSemana } from "@/utils/validation";
import { useToast } from "@/hooks/use-toast";

const DetalleServicio = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [servicio, setServicio] = useState<ServicioResponse | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (id) {
      cargarServicio(parseInt(id));
    }
  }, [id]);

  const cargarServicio = async (servicioId: number) => {
    try {
      setCargando(true);
      const data = await servicioService.obtenerPorId(servicioId);
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

  const obtenerIniciales = (nombre: string) => {
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatearDisponibilidad = (disponibilidad: { [dia: string]: string }) => {
    const diasOrdenados = diasSemana.map(d => d.value);
    return Object.entries(disponibilidad)
      .filter(([dia]) => diasOrdenados.includes(dia))
      .sort(([a], [b]) => diasOrdenados.indexOf(a) - diasOrdenados.indexOf(b))
      .map(([dia, horario]) => {
        const diaLabel = diasSemana.find(d => d.value === dia)?.label || dia;
        return { dia: diaLabel, horario };
      });
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
          <div className="text-center py-12">
            <p className="text-muted-foreground">Servicio no encontrado</p>
            <Link to="/">
              <Button className="mt-4" variant="outline">
                Volver al inicio
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a servicios
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header del Servicio */}
            <Card className="bg-serviceCard">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={servicio.imagenUrl} alt={servicio.nombreOficio} />
                    <AvatarFallback className="text-2xl">
                      {obtenerIniciales(servicio.nombreOficio)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">
                      {servicio.nombreOficio}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-base">
                      <MapPin className="w-4 h-4" />
                      {servicio.ubicacion}
                    </CardDescription>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Briefcase className="w-4 h-4" />
                        <span>{servicio.experiencia} años de experiencia</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4" />
                        <span>{servicio.trabajosCompletados} trabajos completados</span>
                      </div>
                    </div>
                  </div>
                  
                  {servicio.tarifaHora && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatearTarifa(servicio.tarifaHora)}
                      </p>
                      <p className="text-sm text-muted-foreground">por hora</p>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {servicio.descripcion && (
                  <>
                    <h3 className="font-semibold mb-2">Sobre mí</h3>
                    <p className="text-muted-foreground">{servicio.descripcion}</p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Especialidades */}
            <Card className="bg-serviceCard">
              <CardHeader>
                <CardTitle>Especialidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {servicio.especialidades.map((esp, idx) => (
                    <Badge key={idx} variant="secondary" className="text-sm px-3 py-1">
                      {esp}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Portafolio */}
            {servicio.portafolios && servicio.portafolios.length > 0 && (
              <Card className="bg-serviceCard">
                <CardHeader>
                  <CardTitle>Portafolio de Trabajos</CardTitle>
                  <CardDescription>
                    Ejemplos de trabajos realizados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {servicio.portafolios.map((portafolio, idx) => (
                      <div key={portafolio.id}>
                        {idx > 0 && <Separator className="my-4" />}
                        <div>
                          <h4 className="font-semibold mb-1">{portafolio.titulo}</h4>
                          <p className="text-sm text-muted-foreground">
                            {portafolio.descripcion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Disponibilidad */}
            <Card className="bg-serviceCard">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Disponibilidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {formatearDisponibilidad(servicio.disponibilidad).map(({ dia, horario }) => (
                    <div key={dia} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{dia}</span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {horario}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Botón de contacto */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6">
                <Button 
                  className="w-full bg-background text-foreground hover:bg-background/90"
                  size="lg"
                >
                  Contactar Profesional
                </Button>
                <p className="text-xs text-center mt-3 opacity-80">
                  Envía una solicitud de servicio
                </p>
              </CardContent>
            </Card>

            {/* Información adicional */}
            <Card className="bg-serviceCard">
              <CardHeader>
                <CardTitle>Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Usuario ID:</span>
                  <span className="font-medium">#{servicio.usuarioId}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Servicio ID:</span>
                  <span className="font-medium">#{servicio.id}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Categoría:</span>
                  <span className="font-medium">{servicio.nombreOficio}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetalleServicio;