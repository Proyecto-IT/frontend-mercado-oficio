import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, FileImage, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { presupuestoServicio } from "@/services/presupuestoServicio";
import { PresupuestoServicioCreateDTO } from "@/types/presupuesto.types";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const MAX_IMAGENES = 5;
const MAX_SIZE_MB = 5;
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

interface ImagenPreview {
  file: File;
  preview: string;
}

const SolicitarPresupuesto = () => {
  const { servicioId } = useParams<{ servicioId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const userId = useSelector((state: RootState) => state.auth.usuarioId);
  
  const [descripcionProblema, setDescripcionProblema] = useState("");
  const [imagenes, setImagenes] = useState<ImagenPreview[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validarImagen = (file: File): string | null => {
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      return "Solo se permiten imágenes JPG, PNG o WEBP";
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `La imagen debe pesar menos de ${MAX_SIZE_MB}MB`;
    }
    return null;
  };

  const handleSeleccionarImagenes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError(null);

    if (imagenes.length + files.length > MAX_IMAGENES) {
      setError(`Solo puedes subir un máximo de ${MAX_IMAGENES} imágenes`);
      return;
    }

    const nuevasImagenes: ImagenPreview[] = [];
    
    for (const file of files) {
      const errorValidacion = validarImagen(file);
      if (errorValidacion) {
        setError(errorValidacion);
        return;
      }

      const preview = URL.createObjectURL(file);
      nuevasImagenes.push({ file, preview });
    }

    setImagenes(prev => [...prev, ...nuevasImagenes]);
  };

  const handleEliminarImagen = (index: number) => {
    setImagenes(prev => {
      const nuevas = [...prev];
      URL.revokeObjectURL(nuevas[index].preview);
      nuevas.splice(index, 1);
      return nuevas;
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!descripcionProblema.trim()) {
      setError("Por favor describe el problema");
      return;
    }

    if (!userId || !servicioId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Datos de sesión inválidos"
      });
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      // 1. Crear presupuesto
      const dto: PresupuestoServicioCreateDTO = {
        servicioId: Number(servicioId),
        idCliente: userId,
        descripcionProblema: descripcionProblema.trim()
      };

      console.log("📝 Creando presupuesto...");
      const presupuestoCreado = await presupuestoServicio.crear(dto);
      console.log("✅ Presupuesto creado:", presupuestoCreado.id);

      // 2. Subir imágenes si hay alguna
      if (imagenes.length > 0) {
        console.log(`📤 Subiendo ${imagenes.length} imágenes...`);
        
        for (let i = 0; i < imagenes.length; i++) {
          try {
            await presupuestoServicio.cargarArchivo(
              presupuestoCreado.id,
              imagenes[i].file
            );
            console.log(`✅ Imagen ${i + 1}/${imagenes.length} subida`);
          } catch (error) {
            console.error(`❌ Error subiendo imagen ${i + 1}:`, error);
            throw new Error(`Error al subir la imagen ${i + 1}`);
          }
        }
        
        console.log("✅ Todas las imágenes subidas exitosamente");
      }

      // Limpiar URLs de preview
      imagenes.forEach(img => URL.revokeObjectURL(img.preview));

      toast({
        title: "¡Presupuesto solicitado!",
        description: "El prestador recibirá tu solicitud y te responderá pronto"
      });

      navigate(`/servicio/${servicioId}`);
      
    } catch (error) {
      console.error("❌ Error al solicitar presupuesto:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar la solicitud. Intenta nuevamente"
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Solicitar Presupuesto</CardTitle>
            <CardDescription>
              Describe el problema y adjunta hasta 5 imágenes para que el prestador 
              pueda darte un mejor presupuesto
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Descripción del problema */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">
                  Descripción del problema <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe detalladamente el problema que necesitas resolver..."
                  value={descripcionProblema}
                  onChange={(e) => setDescripcionProblema(e.target.value)}
                  rows={6}
                  className="resize-none"
                  disabled={enviando}
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo 10 caracteres
                </p>
              </div>

              {/* Sección de imágenes */}
              <div className="space-y-3">
                <Label>
                  Imágenes (opcional - máximo {MAX_IMAGENES})
                </Label>
                
                {/* Grid de imágenes */}
                {imagenes.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {imagenes.map((imagen, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imagen.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleEliminarImagen(index)}
                          disabled={enviando}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                          {(imagen.file.size / 1024 / 1024).toFixed(1)}MB
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botón para agregar imágenes */}
                {imagenes.length < MAX_IMAGENES && (
                  <div>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={handleSeleccionarImagenes}
                      disabled={enviando}
                    />
                    <label
                      htmlFor="file-upload"
                      className={`flex items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        enviando 
                          ? 'border-muted bg-muted/50 cursor-not-allowed' 
                          : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
                      }`}
                    >
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Haz clic para seleccionar imágenes
                      </span>
                    </label>
                  </div>
                )}

                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <FileImage className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>Formatos: JPG, PNG, WEBP</p>
                    <p>Tamaño máximo: {MAX_SIZE_MB}MB por imagen</p>
                    <p>Imágenes: {imagenes.length}/{MAX_IMAGENES}</p>
                  </div>
                </div>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={enviando}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={enviando || !descripcionProblema.trim() || descripcionProblema.trim().length < 10}
                  className="flex-1"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Solicitud"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SolicitarPresupuesto;