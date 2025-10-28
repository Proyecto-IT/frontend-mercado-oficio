import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, ListChecks, Edit, Eye, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { presupuestoServicio } from "@/services/presupuestoServicio";
import { hitoServicio } from "@/services/hitoServicio";
import { PresupuestoServicioDTO, EstadoPresupuesto } from "@/types/presupuesto.types";
import { useToast } from "@/hooks/use-toast";

const PresupuestosPorServicio = () => {
  const { servicioId } = useParams<{ servicioId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [presupuestos, setPresupuestos] = useState<PresupuestoServicioDTO[]>([]);
  const [presupuestosConHitos, setPresupuestosConHitos] = useState<Set<number>>(new Set());
  const [cargando, setCargando] = useState(true);
  const [verificandoHitos, setVerificandoHitos] = useState(false);

  useEffect(() => {
    if (servicioId) {
      cargarPresupuestos();
    }
  }, [servicioId]);

  const cargarPresupuestos = async () => {
    if (!servicioId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "ID de servicio no válido"
      });
      navigate('/mis-servicios');
      return;
    }
    
    try {
      setCargando(true);
      console.log("🔍 Cargando presupuestos para servicio:", servicioId);
      
      // Llamar al nuevo método que filtra por servicio en el backend
      const data = await presupuestoServicio.obtenerPorServicio(Number(servicioId));
      console.log("✅ Presupuestos obtenidos:", data);
      
      setPresupuestos(data);
      
      // Verificar cuáles tienen hitos
      if (data.length > 0) {
        await verificarHitos(data);
      }
    } catch (err) {
      console.error("❌ Error al cargar presupuestos:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los presupuestos"
      });
    } finally {
      setCargando(false);
    }
  };

  const verificarHitos = async (presupuestos: PresupuestoServicioDTO[]) => {
    setVerificandoHitos(true);
    const conHitos = new Set<number>();
    
    for (const presupuesto of presupuestos) {
      try {
        const hitos = await hitoServicio.obtenerHitosPresupuesto(presupuesto.id);
        if (hitos && hitos.length > 0) {
          conHitos.add(presupuesto.id);
          console.log(`✅ Presupuesto ${presupuesto.id} tiene ${hitos.length} hitos`);
        }
      } catch (err) {
        console.log(`ℹ️ Presupuesto ${presupuesto.id} no tiene hitos`);
      }
    }
    
    setPresupuestosConHitos(conHitos);
    setVerificandoHitos(false);
  };

  const handleNavegar = (path: string) => {
    navigate(path);
  };

  const getEstadoBadge = (estado: EstadoPresupuesto) => {
    const estadoConfig = {
      [EstadoPresupuesto.PENDIENTE]: { 
        variant: "secondary" as const, 
        label: "Pendiente", 
        icon: Clock 
      },
      [EstadoPresupuesto.APROBADO]: { 
        variant: "default" as const, 
        label: "Aprobado", 
        icon: CheckCircle 
      },
      [EstadoPresupuesto.RECHAZADO]: { 
        variant: "destructive" as const, 
        label: "Rechazado", 
        icon: XCircle 
      },
    };

    const config = estadoConfig[estado] || estadoConfig[EstadoPresupuesto.PENDIENTE];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calcularPresupuestoTotal = (presupuesto: PresupuestoServicioDTO) => {
    // Validar que los valores existan antes de calcular
    if (!presupuesto.tarifaHora || !presupuesto.horasEstimadas) {
      return 0;
    }
    
    const tarifa = typeof presupuesto.tarifaHora === 'string' 
      ? parseFloat(presupuesto.tarifaHora) 
      : presupuesto.tarifaHora;
    
    const materiales = presupuesto.costoMateriales || 0;
    
    return (tarifa * presupuesto.horasEstimadas) + materiales;
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-4">Cargando presupuestos...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Presupuestos del Servicio</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona los presupuestos asociados a este servicio
            </p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/mis-servicios')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>

        {presupuestos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay presupuestos</h3>
              <p className="text-muted-foreground">
                Este servicio aún no tiene presupuestos solicitados
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {presupuestos.map((presupuesto) => (
              <Card key={presupuesto.id} className="bg-serviceCard hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        Presupuesto #{presupuesto.id}
                      </CardTitle>
                      <CardDescription className="text-sm space-y-1">
                        <p><span className="font-medium">Cliente:</span> {presupuesto.nombreCliente} {presupuesto.apellidoCliente}</p>
                        <p><span className="font-medium">Fecha:</span> {formatearFecha(presupuesto.fechaCreacion)}</p>
                      </CardDescription>
                    </div>
                    {getEstadoBadge(presupuesto.estado)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Descripción del problema */}
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                      Descripción del Problema:
                    </h4>
                    <p className="text-sm line-clamp-3">{presupuesto.descripcionProblema}</p>
                  </div>

                  {/* Solución propuesta (si existe) */}
                  {presupuesto.descripcionSolucion && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                        Solución Propuesta:
                      </h4>
                      <p className="text-sm line-clamp-2">{presupuesto.descripcionSolucion}</p>
                    </div>
                  )}

                  {/* Detalles del presupuesto */}
                  {presupuesto.respondido && presupuesto.horasEstimadas && presupuesto.tarifaHora && (
                    <div className="space-y-2 p-3 bg-primary/10 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Horas estimadas:</span>
                        <span className="font-medium">{presupuesto.horasEstimadas || 0}h</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tarifa/hora:</span>
                        <span className="font-medium">
                          ${(() => {
                            const tarifa = typeof presupuesto.tarifaHora === 'string' 
                              ? parseFloat(presupuesto.tarifaHora) 
                              : presupuesto.tarifaHora;
                            return (tarifa || 0).toFixed(2);
                          })()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Materiales:</span>
                        <span className="font-medium">${(presupuesto.costoMateriales || 0).toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm pt-2 border-t">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-lg text-primary">
                          ${(calcularPresupuestoTotal(presupuesto) || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Horarios seleccionados */}
                  {presupuesto.horariosSeleccionados && presupuesto.horariosSeleccionados.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                        Horarios Seleccionados:
                      </h4>
                      <div className="space-y-1">
                        {presupuesto.horariosSeleccionados.slice(0, 3).map((horario, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(horario.fecha).toLocaleDateString('es-AR')} | {horario.horaInicio} - {horario.horaFin}
                            </span>
                          </div>
                        ))}
                        {presupuesto.horariosSeleccionados.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{presupuesto.horariosSeleccionados.length - 3} horarios más
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Archivos adjuntos */}
                  {presupuesto.archivos && presupuesto.archivos.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>{presupuesto.archivos.length} archivo(s) adjunto(s)</span>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="space-y-2 pt-2">
                    {/* Botón para responder presupuesto */}
                    {presupuesto.estado === EstadoPresupuesto.PENDIENTE && (
                      <Button
                        className="w-full bg-workerButton hover:bg-workerButton/90 text-workerButton-text"
                        onClick={() => handleNavegar(`/responder-presupuesto/${presupuesto.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Responder Presupuesto
                      </Button>
                    )}

                    {/* Botón para ver detalles */}
                    {presupuesto.respondido && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleNavegar(`/ver-presupuesto/${presupuesto.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </Button>
                    )}

                    {/* Botón para ver hitos (solo si tiene hitos) */}
                    {verificandoHitos ? (
                      <Button variant="outline" className="w-full" disabled>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verificando hitos...
                      </Button>
                    ) : (
                      presupuestosConHitos.has(presupuesto.id) && (
                        <Button
                          variant="outline"
                          className="w-full border-primary text-primary hover:bg-primary/10"
                          onClick={() => handleNavegar(`/ver-hitos/${presupuesto.id}`)}
                        >
                          <ListChecks className="w-4 h-4 mr-2" />
                          Ver Hitos
                        </Button>
                      )
                    )}
                  </div>

                  {/* Indicador de respuesta */}
                  {presupuesto.respondido && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span>
                        Respondido el {presupuesto.fechaRespuesta 
                          ? formatearFecha(presupuesto.fechaRespuesta)
                          : formatearFecha(presupuesto.fechaActualizacion)}
                      </span>
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

export default PresupuestosPorServicio;