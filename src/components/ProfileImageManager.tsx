// src/components/ProfileImageManager.tsx
import { useState, useEffect, useRef } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usuarioService } from "@/services/usuarioService";

interface ProfileImageManagerProps {
  onImageChange: (file: File | null, mantieneImagenPerfil: boolean) => void;
}

type OpcionImagen = 'mantener' | 'nueva' | 'ninguna';

const ProfileImageManager = ({ onImageChange }: ProfileImageManagerProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cargando, setCargando] = useState(true);
  const [tieneImagenPerfil, setTieneImagenPerfil] = useState(false);
  const [imagenPerfilUrl, setImagenPerfilUrl] = useState<string | null>(null);
  
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<OpcionImagen>('mantener');
  const [nuevaImagenFile, setNuevaImagenFile] = useState<File | null>(null);
  const [nuevaImagenPreview, setNuevaImagenPreview] = useState<string | null>(null);

  useEffect(() => {
    cargarImagenPerfil();
  }, []);

  useEffect(() => {
    // Notificar cambios al componente padre
    if (opcionSeleccionada === 'mantener') {
      onImageChange(null, true);
    } else if (opcionSeleccionada === 'nueva') {
      onImageChange(nuevaImagenFile, false);
    } else {
      onImageChange(null, false);
    }
  }, [opcionSeleccionada, nuevaImagenFile]);

  const cargarImagenPerfil = async () => {
    try {
      setCargando(true);
      const data = await usuarioService.obtenerImagenPerfil();
      
      setTieneImagenPerfil(data.tieneImagen);
      
      if (data.tieneImagen && data.imagen && data.imagenTipo) {
        const url = usuarioService.construirImagenUrl(data.imagen, data.imagenTipo);
        setImagenPerfilUrl(url);
        setOpcionSeleccionada('mantener');
      } else {
        setOpcionSeleccionada('nueva');
      }
    } catch (error) {
      console.error("Error al cargar imagen de perfil:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar la imagen de perfil"
      });
    } finally {
      setCargando(false);
    }
  };

  const handleNuevaImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Formato no válido",
        description: "Solo se permiten imágenes JPG, PNG, GIF o WEBP"
      });
      return;
    }

    // Validar tamaño (máx 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Archivo muy grande",
        description: "La imagen no debe superar los 10MB"
      });
      return;
    }

    setNuevaImagenFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setNuevaImagenPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const eliminarNuevaImagen = () => {
    setNuevaImagenFile(null);
    setNuevaImagenPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (cargando) {
    return (
      <Card className="bg-serviceCard">
        <CardHeader>
          <CardTitle>Imagen de Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-serviceCard">
      <CardHeader>
        <CardTitle>Imagen de Perfil</CardTitle>
        <CardDescription>
          Esta imagen se mostrará en todos tus servicios
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Alerta informativa */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {tieneImagenPerfil
              ? "Ya tienes una imagen de perfil. Puedes mantenerla, cambiarla o no usar ninguna."
              : "No tienes una imagen de perfil. Puedes agregar una ahora o dejarlo sin imagen."}
          </AlertDescription>
        </Alert>

        {/* Opciones de imagen */}
        <RadioGroup
          value={opcionSeleccionada}
          onValueChange={(value) => setOpcionSeleccionada(value as OpcionImagen)}
          className="space-y-3"
        >
          {/* Opción: Mantener imagen actual */}
          {tieneImagenPerfil && (
            <div className="flex items-start space-x-3 p-4 border rounded-lg bg-background">
              <RadioGroupItem value="mantener" id="mantener" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="mantener" className="cursor-pointer font-medium">
                  Mantener imagen actual
                </Label>
                {imagenPerfilUrl && (
                  <img
                    src={imagenPerfilUrl}
                    alt="Imagen de perfil actual"
                    className="mt-2 w-32 h-32 rounded-lg object-cover border"
                  />
                )}
              </div>
            </div>
          )}

          {/* Opción: Nueva imagen */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg bg-background">
            <RadioGroupItem value="nueva" id="nueva" className="mt-1" />
            <div className="flex-1 space-y-3">
              <Label htmlFor="nueva" className="cursor-pointer font-medium">
                {tieneImagenPerfil ? "Usar una nueva imagen" : "Agregar imagen"}
              </Label>
              
              {opcionSeleccionada === 'nueva' && (
                <>
                  {nuevaImagenPreview ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                      <img
                        src={nuevaImagenPreview}
                        alt="Nueva imagen"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1"
                        onClick={eliminarNuevaImagen}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Haz click para subir una imagen
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG, GIF o WEBP (máx. 10MB)
                      </p>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleNuevaImagenChange}
                    className="hidden"
                  />
                  
                  {!nuevaImagenPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Seleccionar Imagen
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Opción: Sin imagen */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg bg-background">
            <RadioGroupItem value="ninguna" id="ninguna" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="ninguna" className="cursor-pointer font-medium">
                No usar imagen de perfil
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Tus servicios se mostrarán sin imagen
              </p>
            </div>
          </div>
        </RadioGroup>

        {/* Advertencia sobre cambios */}
        {(opcionSeleccionada === 'nueva' || opcionSeleccionada === 'ninguna') && tieneImagenPerfil && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {opcionSeleccionada === 'nueva'
                ? "Al cambiar tu imagen de perfil, se actualizará en TODOS tus servicios existentes."
                : "Al eliminar tu imagen de perfil, se quitará de TODOS tus servicios existentes."}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileImageManager;