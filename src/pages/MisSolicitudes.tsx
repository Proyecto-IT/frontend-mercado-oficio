import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { selectUsuarioId, selectIsAuthenticated } from "@/store/authSlice";
import Header from "@/components/Header";
import SolicitudPresupuestoCard from "@/components/SolicitudPresupuestoCard";
import { presupuestoServicio } from "@/services/presupuestoServicio";
import { PresupuestoServicioDTO, EstadoPresupuesto } from "@/types/presupuesto.types";
import { hitoServicio, HitoResponseDTO } from "@/services/hitoServicio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileQuestion, CheckCircle, Clock, DollarSign, Package } from "lucide-react";
import { EstadoHito } from "@/types/hitos.types";
import { useToast } from "@/hooks/use-toast";

const MisSolicitudes = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const usuarioId = useAppSelector(selectUsuarioId);
  const { toast } = useToast();

  const [solicitudes, setSolicitudes] = useState<PresupuestoServicioDTO[]>([]);
  const [hitos, setHitos] = useState<HitoResponseDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoHitos, setCargandoHitos] = useState(true);
  const [procesando, setProcesando] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !usuarioId) {
      navigate("/auth");
      return;
    }

    cargarSolicitudes();
    cargarHitos();
  }, [isAuthenticated, usuarioId, navigate]);

  const cargarSolicitudes = async () => {
    if (!usuarioId) return;

    try {
      setCargando(true);
      const data = await presupuestoServicio.obtenerPorCliente(usuarioId);
      setSolicitudes(data);
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
    } finally {
      setCargando(false);
    }
  };

  const cargarHitos = async () => {
    if (!usuarioId) return;
    
    try {
      setCargandoHitos(true);
      const data = await hitoServicio.obtenerHitosCliente(usuarioId);
      setHitos(data);
    } catch (err) {
      console.error("Error al cargar hitos:", err);
    } finally {
      setCargandoHitos(false);
    }
  };

  const handleActualizarSolicitud = () => {
    cargarSolicitudes();
  };

  const aprobarHito = async (hitoId: number) => {
    try {
      setProcesando(hitoId);
      await hitoServicio.aprobarHito(hitoId);
      toast({
        title: "Hito aprobado",
        description: "El hito ha sido aprobado correctamente"
      });
      await cargarHitos();
    } catch (err) {
      console.error("Error al aprobar hito:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo aprobar el hito"
      });
    } finally {
      setProcesando(null);
    }
  };

  const liberarFondos = async (hitoId: number) => {
    try {
      setProcesando(hitoId);
      await hitoServicio.liberarFondos(hitoId);
      toast({
        title: "Fondos liberados",
        description: "Los fondos han sido liberados al prestador"
      });
      await cargarHitos();
    } catch (err) {
      console.error("Error al liberar fondos:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron liberar los fondos"
      });
    } finally {
      setProcesando(null);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const estadoMap: { 
      [key: string]: { 
        variant: "default" | "secondary" | "destructive" | "outline", 
        label: string,
        color?: string 
      } 
    } = {
      [EstadoHito.PENDIENTE]: { variant: "secondary", label: "Pendiente" },
      [EstadoHito.EN_PROGRESO]: { variant: "default", label: "En Progreso" },
      [EstadoHito.COMPLETADO]: { variant: "outline", label: "Completado", color: "text-blue-600" },
      [EstadoHito.APROBADO_CLIENTE]: { variant: "default", label: "Aprobado" },
      [EstadoHito.PAGADO]: { variant: "outline", label: "Pagado", color: "text-green-600" },
      [EstadoHito.DISPUTADO]: { variant: "destructive", label: "Disputado" },
      [EstadoHito.CANCELADO]: { variant: "destructive", label: "Cancelado" },
    };

    const config = estadoMap[estado] || { variant: "outline" as const, label: estado };
    return <Badge variant={config.variant} className={config.color}>{config.label}</Badge>;
  };

  const solicitudesValidas = solicitudes.filter(
    (sol) => 
      (sol.presupuesto && sol.presupuesto > 0 && sol.respondido) ||
      sol.estado === EstadoPresupuesto.APROBADO ||
      sol.estado === EstadoPresupuesto.RECHAZADO
  );

  const hitosActivos = hitos.filter(h => 
    [EstadoHito.PENDIENTE, EstadoHito.EN_PROGRESO, EstadoHito.COMPLETADO, EstadoHito.APROBADO_CLIENTE].includes(h.estado as EstadoHito)
  );
  
  const hitosCompletados = hitos.filter(h => h.estado === EstadoHito.PAGADO);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Mis Solicitudes y Pedidos
          </h1>
        </div>

        <Tabs defaultValue="solicitudes" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="solicitudes">
              Solicitudes de Presupuesto
            </TabsTrigger>
            <TabsTrigger value="hitos">
              Mis Hitos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="solicitudes">
            {cargando ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : solicitudesValidas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileQuestion className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg mb-2">
                  No tienes solicitudes de presupuesto respondidas.
                </p>
                <p className="text-sm text-muted-foreground">
                  Las solicitudes aparecerán aquí cuando los prestadores respondan con sus presupuestos.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {solicitudesValidas.map((solicitud) => (
                  <SolicitudPresupuestoCard
                    key={solicitud.id}
                    solicitud={solicitud}
                    onActualizar={handleActualizarSolicitud}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="hitos">
            {cargandoHitos ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : hitos.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No hay hitos registrados</h3>
                  <p className="text-muted-foreground">
                    Aún no tienes hitos en tus servicios contratados
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {hitosActivos.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Hitos Activos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {hitosActivos.map((hito) => (
                        <Card key={hito.id} className="bg-serviceCard hover:shadow-lg transition-shadow">
                          <CardContent className="pt-6 space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-1">Hito #{hito.numeroHito}</h3>
                                <p className="text-sm text-muted-foreground">Presupuesto #{hito.presupuestoId}</p>
                              </div>
                              {getEstadoBadge(hito.estado)}
                            </div>

                            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                              <span className="text-sm text-muted-foreground">Monto:</span>
                              <span className="font-bold text-lg text-primary">
                                ${(hito.monto || 0).toFixed(2)}
                              </span>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {new Date(hito.fechaInicio).toLocaleDateString('es-AR')}
                                </span>
                              </div>
                            </div>

                            {hito.estado === EstadoHito.COMPLETADO && (
                              <Button
                                className="w-full bg-primary hover:bg-primary/90"
                                onClick={() => aprobarHito(hito.id)}
                                disabled={procesando === hito.id}
                              >
                                {procesando === hito.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Aprobando...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Aprobar Hito
                                  </>
                                )}
                              </Button>
                            )}

                            {hito.estado === EstadoHito.APROBADO_CLIENTE && (
                              <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => liberarFondos(hito.id)}
                                disabled={procesando === hito.id}
                              >
                                {procesando === hito.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Liberando...
                                  </>
                                ) : (
                                  <>
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    Liberar Fondos
                                  </>
                                )}
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {hitosCompletados.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Hitos Completados</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {hitosCompletados.map((hito) => (
                        <Card key={hito.id} className="bg-serviceCard hover:shadow-lg transition-shadow">
                          <CardContent className="pt-6 space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-1">Hito #{hito.numeroHito}</h3>
                                <p className="text-sm text-muted-foreground">Presupuesto #{hito.presupuestoId}</p>
                              </div>
                              {getEstadoBadge(hito.estado)}
                            </div>

                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                              <span className="text-sm text-muted-foreground">Monto Pagado:</span>
                              <span className="font-bold text-lg text-green-600">
                                ${(hito.monto || 0).toFixed(2)}
                              </span>
                            </div>

                            <div className="text-xs text-green-600 text-center p-2 bg-green-50 rounded font-medium">
                              ✓ Fondos liberados al prestador
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MisSolicitudes;