import { useState, useEffect } from "react";
import { CheckCircle, Clock, AlertCircle, Loader2, ArrowLeft, DollarSign, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { hitoServicio, HitoResponseDTO } from "@/services/hitoServicio";
import { useToast } from "@/hooks/use-toast";
import { EstadoHito } from "@/types/hitos.types";
import { useAppSelector } from "@/store/hooks";
import { selectUsuarioId, selectIsAuthenticated } from "@/store/authSlice";
import { useNavigate } from "react-router-dom";

const VerHitosCliente = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const usuarioId = useAppSelector(selectUsuarioId);
  
  const [hitos, setHitos] = useState<HitoResponseDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !usuarioId) {
      navigate("/auth");
      return;
    }
    cargarHitos();
  }, [isAuthenticated, usuarioId]);

  const cargarHitos = async () => {
    if (!usuarioId) return;
    
    try {
      setCargando(true);
      console.log("🔍 Cargando hitos para cliente:", usuarioId);
      const data = await hitoServicio.obtenerHitosCliente(usuarioId);
      console.log("✅ Hitos obtenidos:", data);
      setHitos(data);
    } catch (err) {
      console.error("❌ Error al cargar hitos:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los hitos"
      });
    } finally {
      setCargando(false);
    }
  };

  const aprobarHito = async (hitoId: number) => {
    try {
      setProcesando(hitoId);
      console.log("✅ Aprobando hito:", hitoId);
      
      await hitoServicio.aprobarHito(hitoId);
      
      toast({
        title: "Hito aprobado",
        description: "El hito ha sido aprobado correctamente"
      });
      
      await cargarHitos();
    } catch (err) {
      console.error("❌ Error al aprobar hito:", err);
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
      console.log("💰 Liberando fondos del hito:", hitoId);
      
      await hitoServicio.liberarFondos(hitoId);
      
      toast({
        title: "Fondos liberados",
        description: "Los fondos han sido liberados al prestador"
      });
      
      await cargarHitos();
    } catch (err) {
      console.error("❌ Error al liberar fondos:", err);
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

  const agruparPorPresupuesto = (hitos: HitoResponseDTO[]) => {
    const grupos = new Map<number, HitoResponseDTO[]>();
    hitos.forEach(hito => {
      if (!grupos.has(hito.presupuestoId)) {
        grupos.set(hito.presupuestoId, []);
      }
      grupos.get(hito.presupuestoId)!.push(hito);
    });
    return grupos;
  };

  const filtrarHitosPorEstado = (hitos: HitoResponseDTO[], estados: EstadoHito[]) => {
    return hitos.filter(h => estados.includes(h.estado as EstadoHito));
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-4">Cargando hitos...</p>
          </div>
        </main>
      </div>
    );
  }

  const hitosActivos = filtrarHitosPorEstado(hitos, [
    EstadoHito.PENDIENTE, 
    EstadoHito.EN_PROGRESO, 
    EstadoHito.COMPLETADO,
    EstadoHito.APROBADO_CLIENTE
  ]);
  
  const hitosCompletados = filtrarHitosPorEstado(hitos, [EstadoHito.PAGADO]);

  const HitoCard = ({ hito }: { hito: HitoResponseDTO }) => (
    <Card className="bg-serviceCard hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">
              Hito #{hito.numeroHito}
            </CardTitle>
            <CardDescription className="text-sm">
              <div>Presupuesto #{hito.presupuestoId}</div>
              <div className="mt-1">{hito.descripcion}</div>
            </CardDescription>
          </div>
          {getEstadoBadge(hito.estado)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
          <span className="text-sm text-muted-foreground">Monto:</span>
          <span className="font-bold text-lg text-primary">
            ${(hito.monto || 0).toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Porcentaje:</span>
          <span className="font-medium">{hito.porcentajePresupuesto || 0}%</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Inicio:</p>
              <p className="font-medium">
                {new Date(hito.fechaInicio).toLocaleDateString('es-AR')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Fin estimado:</p>
              <p className="font-medium">
                {new Date(hito.fechaFinalizacionEstimada).toLocaleDateString('es-AR')}
              </p>
            </div>
          </div>

          {hito.fechaCompletado && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Completado:</p>
                <p className="font-medium text-green-600">
                  {new Date(hito.fechaCompletado).toLocaleDateString('es-AR')}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground break-all">
          <span className="font-medium">Escrow ID:</span> {hito.escrowId}
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
                Liberando fondos...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Liberar Fondos
              </>
            )}
          </Button>
        )}

        {hito.estado === EstadoHito.PENDIENTE && (
          <div className="text-xs text-muted-foreground text-center p-2 bg-secondary/20 rounded">
            El prestador aún no ha iniciado este hito
          </div>
        )}

        {hito.estado === EstadoHito.EN_PROGRESO && (
          <div className="text-xs text-blue-600 text-center p-2 bg-blue-50 rounded">
            El prestador está trabajando en este hito
          </div>
        )}

        {hito.estado === EstadoHito.PAGADO && (
          <div className="text-xs text-green-600 text-center p-2 bg-green-50 rounded font-medium">
            ✓ Fondos liberados al prestador
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mis Hitos</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona los hitos de tus servicios contratados
            </p>
          </div>
          
          <Button variant="outline" onClick={() => navigate('/mis-solicitudes')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>

        {hitos.length === 0 ? (
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
          <Tabs defaultValue="activos" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="activos">
                Activos ({hitosActivos.length})
              </TabsTrigger>
              <TabsTrigger value="completados">
                Completados ({hitosCompletados.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activos">
              {hitosActivos.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No tienes hitos activos en este momento
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hitosActivos.map((hito) => (
                    <HitoCard key={hito.id} hito={hito} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completados">
              {hitosCompletados.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No tienes hitos completados todavía
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hitosCompletados.map((hito) => (
                    <HitoCard key={hito.id} hito={hito} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default VerHitosCliente;