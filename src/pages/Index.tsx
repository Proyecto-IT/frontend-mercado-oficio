// src/pages/Index.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, Star, Briefcase, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { servicioService } from "@/services/servicioService";
import { ServicioResponse } from "@/types/servicio.types";
import { formatearTarifa } from "@/utils/validation";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [servicios, setServicios] = useState<ServicioResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroOficio, setFiltroOficio] = useState<string | null>(null);

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      setCargando(true);
      const data = await servicioService.obtenerTodos();
      setServicios(data);
    } catch (err) {
      console.error("Error al cargar servicios:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los servicios"
      });
    } finally {
      setCargando(false);
    }
  };

  // Obtener oficios únicos para filtros
  const oficiosUnicos = Array.from(new Set(servicios.map(s => s.nombreOficio)));

  // Filtrar servicios
  const serviciosFiltrados = servicios.filter(servicio => {
    const matchBusqueda = busqueda === "" || 
      servicio.nombreOficio.toLowerCase().includes(busqueda.toLowerCase()) ||
      servicio.ubicacion.toLowerCase().includes(busqueda.toLowerCase()) ||
      (servicio.nombreTrabajador && servicio.nombreTrabajador.toLowerCase().includes(busqueda.toLowerCase())) ||
      (servicio.descripcion && servicio.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
    
    const matchOficio = !filtroOficio || servicio.nombreOficio === filtroOficio;
    
    return matchBusqueda && matchOficio;
  });

  const obtenerDisponibilidad = (disponibilidad: { [dia: string]: string }) => {
    const diasActivos = Object.keys(disponibilidad);
    if (diasActivos.length === 0) return "No disponible";
    if (diasActivos.length === 7) return "Disponible todos los días";
    return `Disponible ${diasActivos.length} días`;
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando servicios...</p>
          </div>
        </main>
      </div>
    );
  }

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

          {/* Buscador */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por servicio, ubicación o profesional..."
                className="pl-10 py-6 text-lg"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Filtros por oficio */}
        {oficiosUnicos.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Categorías</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filtroOficio === null ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroOficio(null)}
              >
                Todos ({servicios.length})
              </Button>
              {oficiosUnicos.map(oficio => {
                const count = servicios.filter(s => s.nombreOficio === oficio).length;
                return (
                  <Button
                    key={oficio}
                    variant={filtroOficio === oficio ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroOficio(oficio)}
                  >
                    {oficio} ({count})
                  </Button>
                );
              })}
            </div>
          </section>
        )}

        {/* Lista de servicios */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-card-foreground">
              {filtroOficio ? `${filtroOficio}s Disponibles` : "Profesionales Destacados"}
            </h2>
            <span className="text-sm text-muted-foreground">
              {serviciosFiltrados.length} profesionales encontrados
            </span>
          </div>
          
          {serviciosFiltrados.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No se encontraron servicios</h3>
                <p className="text-muted-foreground">
                  Intenta con otros términos de búsqueda o filtros
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {serviciosFiltrados.map((servicio) => (
                <Card key={servicio.id} className="bg-serviceCard hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      {/* Imagen del trabajador */}
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        {servicio.imagenUrl ? (
                          <img
                            src={servicio.imagenUrl}
                            alt={`${servicio.nombreTrabajador} ${servicio.apellidoTrabajador}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                            {servicio.nombreTrabajador?.charAt(0) || "?"}
                          </div>
                        )}
                      </div>

                      {/* Información principal */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <CardTitle className="text-xl mb-1">
                              {servicio.nombreTrabajador} {servicio.apellidoTrabajador}
                            </CardTitle>
                            <Badge variant="secondary" className="mb-2">
                              {servicio.nombreOficio}
                            </Badge>
                          </div>
                          
                          {servicio.tarifaHora && (
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">
                                {formatearTarifa(servicio.tarifaHora)}
                              </p>
                              <p className="text-xs text-muted-foreground">por hora</p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">
                              {servicio.trabajosCompletados > 0 ? "4.8" : "Nuevo"}
                            </span>
                            {servicio.trabajosCompletados > 0 && (
                              <span>({servicio.trabajosCompletados} trabajos)</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{servicio.ubicacion}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{obtenerDisponibilidad(servicio.disponibilidad)}</span>
                          </div>
                        </div>

                        {servicio.descripcion && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {servicio.descripcion}
                          </p>
                        )}

                        {/* Especialidades */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {servicio.especialidades.slice(0, 4).map((esp, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {esp}
                            </Badge>
                          ))}
                          {servicio.especialidades.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{servicio.especialidades.length - 4} más
                            </Badge>
                          )}
                        </div>

                        {/* Experiencia y portafolio */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            <strong>{servicio.experiencia}</strong> años de experiencia
                          </span>
                          {servicio.portafolios.length > 0 && (
                            <span>
                              <strong>{servicio.portafolios.length}</strong> trabajos en portafolio
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex gap-3">
                      <Link to={`/servicio/${servicio.id}`} className="flex-1">
                        <Button className="w-full" variant="default">
                          Ver Perfil Completo
                        </Button>
                      </Link>
                      <Button variant="outline">
                        Contactar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;