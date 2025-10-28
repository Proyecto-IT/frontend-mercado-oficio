// ResponderPresupuestoPage.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { selectUsuarioId } from '@/store/authSlice';
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle, Image as ImageIcon, Play } from "lucide-react";
import { presupuestoServicio } from "@/services/presupuestoServicio";
import { PresupuestoServicioDTO, EstadoPresupuesto, TipoArchivo } from '@/types/presupuesto.types';

const ResponderPresupuestoPage = () => {
  const navigate = useNavigate();
  const { presupuestoId } = useParams<{ presupuestoId: string }>();
  const usuarioId = useSelector((state: RootState) => selectUsuarioId(state));

  const [presupuesto, setPresupuesto] = useState<PresupuestoServicioDTO | null>(null);
  const [horasEstimadas, setHorasEstimadas] = useState("");
  const [costoMateriales, setCostoMateriales] = useState("");
  const [descripcionSolucion, setDescripcionSolucion] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [imagenesCargadas, setImagenesCargadas] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const cargarPresupuesto = async () => {
      try {
        const datos = await presupuestoServicio.obtener(Number(presupuestoId));
        setPresupuesto(datos);
        
        // Cargar imágenes de los archivos usando el endpoint de descarga
        if (datos.archivos && datos.archivos.length > 0) {
          const imagenes: { [key: number]: string } = {};
          for (const archivo of datos.archivos) {
            if (archivo.tipoArchivo === TipoArchivo.IMAGEN) {
              try {
                const blob = await presupuestoServicio.obtenerImagen(archivo.id);
                imagenes[archivo.id] = URL.createObjectURL(blob);
              } catch (err) {
                console.error(`Error cargando imagen ${archivo.id}:`, err);
              }
            }
          }
          setImagenesCargadas(imagenes);
        }
      } catch (err: any) {
        setError("Error al cargar el presupuesto");
        console.error(err);
      } finally {
        setCargando(false);
      }
    };

    if (presupuestoId) {
      cargarPresupuesto();
    }
  }, [presupuestoId]);

  const calcularPresupuesto = (): number => {
    if (!presupuesto?.tarifaHora) return 0;
    
    const tarifaHoraNum = typeof presupuesto.tarifaHora === 'string' 
      ? parseFloat(presupuesto.tarifaHora) 
      : presupuesto.tarifaHora;
    
    const costoLaboral = (Number(horasEstimadas) || 0) * tarifaHoraNum;
    const costoMatNum = Number(costoMateriales) || 0;
    
    return costoLaboral + costoMatNum;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!horasEstimadas || !descripcionSolucion) {
      setError("Las horas estimadas y descripción de solución son requeridas");
      return;
    }

    if (Number(horasEstimadas) <= 0) {
      setError("Las horas estimadas deben ser mayores a 0");
      return;
    }

    if (Number(costoMateriales) < 0) {
      setError("El costo de materiales no puede ser negativo");
      return;
    }

    setEnviando(true);

    try {
      await presupuestoServicio.actualizar(Number(presupuestoId), {
        idPrestador: usuarioId || 0,
        horasEstimadas: Number(horasEstimadas),
        costoMateriales: Number(costoMateriales) || 0,
        descripcionSolucion,
        estado: EstadoPresupuesto.PENDIENTE,
      });

      setExito(true);
      setTimeout(() => {
        navigate("/presupuestos");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al responder presupuesto");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!presupuesto) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="w-full max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Presupuesto no encontrado</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Responder Presupuesto</CardTitle>
            <CardDescription>Proporciona tu estimación de trabajo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {exito && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Presupuesto respondido exitosamente
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Problema y Archivos */}
            <div className="bg-secondary p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cliente:</p>
                  <p className="font-semibold text-lg">
                    {presupuesto.nombreCliente} {presupuesto.apellidoCliente}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Fecha de solicitud:</p>
                  <p className="font-medium">
                    {new Date(presupuesto.fechaCreacion).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Problema del cliente:</p>
                <p className="font-medium">{presupuesto.descripcionProblema}</p>
              </div>

              {presupuesto.archivos && presupuesto.archivos.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Archivos adjuntos:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {presupuesto.archivos.map((archivo) => (
                      <div key={archivo.id} className="relative group">
                        {archivo.tipoArchivo === TipoArchivo.IMAGEN ? (
                          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                            <img
                              src={imagenesCargadas[archivo.id]}
                              alt={archivo.nombreArchivo}
                              className="w-full h-full object-cover group-hover:opacity-75 transition"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/20">
                              <ImageIcon className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="bg-blue-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center group-hover:bg-blue-200 transition">
                            <Play className="w-8 h-8 text-blue-600" />
                          </div>
                        )}
                        <p className="text-xs text-center text-muted-foreground mt-1 truncate">
                          {archivo.nombreArchivo}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="horas" className="block text-sm font-medium mb-2">
                  Horas Estimadas de Trabajo *
                </label>
                <input
                  id="horas"
                  type="number"
                  step="0.5"
                  value={horasEstimadas}
                  onChange={(e) => setHorasEstimadas(e.target.value)}
                  placeholder="Ej: 4"
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="materiales" className="block text-sm font-medium mb-2">
                  Costo de Materiales
                </label>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">$</span>
                  <input
                    id="materiales"
                    type="number"
                    step="0.01"
                    value={costoMateriales}
                    onChange={(e) => setCostoMateriales(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="solucion" className="block text-sm font-medium mb-2">
                  Descripción de la Solución *
                </label>
                <textarea
                  id="solucion"
                  value={descripcionSolucion}
                  onChange={(e) => setDescripcionSolucion(e.target.value)}
                  placeholder="Describe cómo solucionarás el problema..."
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={5}
                  maxLength={1000}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {descripcionSolucion.length}/1000 caracteres
                </p>
              </div>

              {/* Cálculo de presupuesto */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-900">Costo por hora:</span>
                  <span className="font-medium text-blue-900">
                    $ {presupuesto.tarifaHora}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-900">Costo laboral ({horasEstimadas || 0} horas):</span>
                  <span className="font-medium text-blue-900">
                    $ {((Number(horasEstimadas) || 0) * (typeof presupuesto.tarifaHora === 'string' ? parseFloat(presupuesto.tarifaHora) : presupuesto.tarifaHora || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-900">Costo materiales:</span>
                  <span className="font-medium text-blue-900">
                    $ {(Number(costoMateriales) || 0).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-blue-200 pt-2 flex justify-between">
                  <span className="font-semibold text-blue-900">Presupuesto Total:</span>
                  <span className="font-bold text-lg text-blue-900">
                    $ {calcularPresupuesto().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={enviando}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={enviando || exito}>
                  {enviando ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Presupuesto"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResponderPresupuestoPage;