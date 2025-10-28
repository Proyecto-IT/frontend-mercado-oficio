import { useState, useEffect } from "react";
import { CheckCircle, Clock, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { hitoServicio, HitoResponseDTO } from "@/services/hitoServicio";
import { useToast } from "@/hooks/use-toast";
import { EstadoHito } from "@/types/hitos.types";

interface VerHitosPresupuestoProps {
  presupuestoId: number;
  onVolver?: () => void;
}

const VerHitosPresupuesto = ({ presupuestoId, onVolver }: VerHitosPresupuestoProps) => {
  const { toast } = useToast();
  const [hitos, setHitos] = useState<HitoResponseDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<number | null>(null);

  useEffect(() => {
    if (presupuestoId) {
      cargarHitos();
    }
  }, [presupuestoId]);

  const cargarHitos = async () => {
    try {
      setCargando(true);
      console.log("🔍 Cargando hitos para presupuesto:", presupuestoId);
      const data = await hitoServicio.obtenerHitosPresupuesto(presupuestoId);
      console.log("✅ Hitos obtenidos:", data);
      
      // Log detallado de cada hito
      data.forEach((hito, index) => {
        console.log(`Hito ${index + 1}:`, {
          id: hito.id,
          numeroHito: hito.numeroHito,
          estado: hito.estado,
          descripcion: hito.descripcion
        });
      });
      
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

  const completarHito = async (hitoId: number) => {
    try {
      setProcesando(hitoId);
      console.log("🔨 Completando hito:", hitoId);
      
      await hitoServicio.completarHito(hitoId, {
        comentarios: "Hito completado por el prestador"
      });
      
      toast({
        title: "Hito completado",
        description: "El hito ha sido marcado como completado"
      });
      
      // Recargar hitos
      await cargarHitos();
    } catch (err) {
      console.error("❌ Error al completar hito:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo completar el hito"
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
      [EstadoHito.COMPLETADO]: { variant: "outline", label: "Completado", color: "text-green-600" },
      [EstadoHito.APROBADO_CLIENTE]: { variant: "default", label: "Aprobado" },
      [EstadoHito.PAGADO]: { variant: "default", label: "Pagado" },
      [EstadoHito.DISPUTADO]: { variant: "destructive", label: "Disputado" },
      [EstadoHito.CANCELADO]: { variant: "destructive", label: "Cancelado" },
    };

    const config = estadoMap[estado] || { variant: "outline" as const, label: estado };
    return <Badge variant={config.variant} className={config.color}>{config.label}</Badge>;
  };

  const handleVolver = () => {
    if (onVolver) {
      onVolver();
    } else {
      window.history.back();
    }
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Hitos del Presupuesto #{presupuestoId}</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona los hitos de este presupuesto
            </p>
          </div>
          
          <Button variant="outline" onClick={handleVolver}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>

        {hitos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay hitos registrados</h3>
              <p className="text-muted-foreground">
                Este presupuesto aún no tiene hitos creados
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hitos.map((hito) => (
              <Card key={hito.id} className="bg-serviceCard hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        Hito #{hito.numeroHito}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {hito.descripcion}
                      </CardDescription>
                    </div>
                    {getEstadoBadge(hito.estado)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Monto */}
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <span className="text-sm text-muted-foreground">Monto:</span>
                    <span className="font-bold text-lg text-primary">
                      ${(hito.monto || 0).toFixed(2)}
                    </span>
                  </div>

                  {/* Porcentaje */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Porcentaje:</span>
                    <span className="font-medium">{hito.porcentajePresupuesto || 0}%</span>
                  </div>

                  {/* Fechas */}
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

                  {/* Escrow ID */}
                  <div className="text-xs text-muted-foreground break-all">
                    <span className="font-medium">Escrow ID:</span> {hito.escrowId}
                  </div>

                  {/* Botón de acción */}
                  {(hito.estado === EstadoHito.EN_PROGRESO || hito.estado === EstadoHito.PENDIENTE) && (
                    <Button
                      className="w-full bg-workerButton hover:bg-workerButton/90 text-workerButton-text"
                      onClick={() => completarHito(hito.id)}
                      disabled={procesando === hito.id}
                    >
                      {procesando === hito.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Completando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completar Hito
                        </>
                      )}
                    </Button>
                  )}
                  
                  {/* Debug: Mostrar estado actual */}
                  <div className="text-xs text-center p-2 bg-gray-100 rounded font-mono">
                    Estado actual: {hito.estado}
                  </div>

                  {/* Información de estado */}
                  {hito.estado === EstadoHito.PENDIENTE && (
                    <div className="text-xs text-muted-foreground text-center p-2 bg-secondary/20 rounded">
                      Este hito aún no ha iniciado
                    </div>
                  )}

                  {hito.estado === EstadoHito.COMPLETADO && (
                    <div className="text-xs text-green-600 text-center p-2 bg-green-50 rounded">
                      Esperando aprobación del cliente
                    </div>
                  )}

                  {hito.estado === EstadoHito.APROBADO_CLIENTE && (
                    <div className="text-xs text-blue-600 text-center p-2 bg-blue-50 rounded">
                      Aprobado - Esperando liberación de fondos
                    </div>
                  )}

                  {hito.estado === EstadoHito.PAGADO && (
                    <div className="text-xs text-green-600 text-center p-2 bg-green-50 rounded font-medium">
                      ✓ Pagado completamente
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default VerHitosPresupuesto;