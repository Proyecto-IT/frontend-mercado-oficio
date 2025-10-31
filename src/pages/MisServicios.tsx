import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Trash2, Plus, MapPin, Clock, Briefcase, Star, FileText, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Header from "@/components/Header";
import { servicioService } from "@/services/servicioService";
import { presupuestoServicio } from "@/services/presupuestoServicio";
import { ServicioResponse } from "@/types/servicio.types";
import { formatearTarifa, diasSemana } from "@/utils/validation";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { selectUsuarioId } from '@/store/authSlice';

const MisServicios = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const usuarioId = useSelector((state: RootState) => selectUsuarioId(state));
  const [servicios, setServicios] = useState<ServicioResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [servicioAEliminar, setServicioAEliminar] = useState<number | null>(null);
  const [presupuestosPorServicio, setPresupuestosPorServicio] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      setCargando(true);
      const data = await servicioService.obtenerMisServicios();
      setServicios(data);
      
      // Cargar presupuestos para cada servicio
      if (usuarioId) {
        const presupuestos = await presupuestoServicio.obtenerPorPrestador(usuarioId);
        const conteo: { [key: number]: number } = {};
        
        presupuestos.forEach(p => {
          if (p.servicioId) {
            conteo[p.servicioId] = (conteo[p.servicioId] || 0) + 1;
          }
        });
        
        setPresupuestosPorServicio(conteo);
      }
    } catch (err) {
      console.error("Error al cargar servicios:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar tus servicios"
      });
    } finally {
      setCargando(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!servicioAEliminar) return;

    try {
      await servicioService.eliminar(servicioAEliminar);
      
      toast({
        title: "Servicio eliminado",
        description: "El servicio ha sido eliminado correctamente"
      });
      
      // Actualizar lista
      setServicios(prev => prev.filter(s => s.id !== servicioAEliminar));
      setServicioAEliminar(null);
    } catch (err) {
      console.error("Error al eliminar servicio:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el servicio"
      });
    }
  };

  const formatearDisponibilidad = (disponibilidad: { [dia: string]: string }) => {
    const diasOrdenados = diasSemana.map(d => d.value);
    const diasActivos = Object.keys(disponibilidad)
      .filter(dia => diasOrdenados.includes(dia))
      .sort((a, b) => diasOrdenados.indexOf(a) - diasOrdenados.indexOf(b));

    if (diasActivos.length === 0) return "No especificado";
    
    if (diasActivos.length <= 3) {
      return diasActivos
        .map(dia => diasSemana.find(d => d.value === dia)?.label || dia)
        .join(", ");
    }
    
    return `${diasActivos.length} días disponibles`;
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mis Servicios</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona y edita tus servicios profesionales
            </p>
          </div>
          
          <Link to="/worker/register">
            <Button className="bg-workerButton hover:bg-workerButton/90 text-workerButton-text">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Servicio
            </Button>
          </Link>
        </div>

        {/* Lista de servicios */}
        {servicios.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tienes servicios registrados</h3>
              <p className="text-muted-foreground mb-6">
                Comienza a recibir solicitudes registrando tu primer servicio
              </p>
              <Link to="/worker/register">
                <Button className="bg-workerButton hover:bg-workerButton/90 text-workerButton-text">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Servicio
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicios.map(servicio => (
              <Card key={servicio.id} className="bg-serviceCard hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {servicio.nombreOficio}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3" />
                        {servicio.ubicacion}
                      </CardDescription>
                    </div>
                    
                    {servicio.imagenUrl && (
                      <img
                        src={servicio.imagenUrl}
                        alt="Perfil"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Descripción */}
                  {servicio.descripcion && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {servicio.descripcion}
                    </p>
                  )}
                  
                  {/* Info rápida */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Experiencia:</span>
                      <span className="font-medium">{servicio.experiencia} años</span>
                    </div>
                    
                    {servicio.tarifaHora && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tarifa/hora:</span>
                        <span className="font-medium text-primary">
                          {formatearTarifa(servicio.tarifaHora)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Trabajos:</span>
                      <span className="font-medium">{servicio.trabajosCompletados}</span>
                    </div>
                  </div>
                  
                  {/* Disponibilidad */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formatearDisponibilidad(servicio.disponibilidad)}
                    </span>
                  </div>
                  
                  {/* Especialidades */}
                  <div className="flex flex-wrap gap-1">
                    {servicio.especialidades.slice(0, 3).map((esp, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {esp}
                      </Badge>
                    ))}
                    {servicio.especialidades.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{servicio.especialidades.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Portafolios */}
                  {servicio.portafolios && servicio.portafolios.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4" />
                      <span>{servicio.portafolios.length} trabajos en portafolio</span>
                    </div>
                  )}
                  
                  {/* Acciones */}
                  <div className="space-y-2 pt-2">
                    <div className="flex gap-2">
                      <Link to={`/editar-servicio/${servicio.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      </Link>
                      
                      <Button
                        variant="outline"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setServicioAEliminar(servicio.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Botones adicionales */}
                    {presupuestosPorServicio[servicio.id] > 0 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/presupuestos-servicio/${servicio.id}`)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Ver Presupuestos ({presupuestosPorServicio[servicio.id]})
                      </Button>
                    )}

                    
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog de confirmación */}
        <AlertDialog open={servicioAEliminar !== null} onOpenChange={() => setServicioAEliminar(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El servicio y todos sus portafolios serán eliminados permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmarEliminar}
                className="bg-destructive hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default MisServicios;