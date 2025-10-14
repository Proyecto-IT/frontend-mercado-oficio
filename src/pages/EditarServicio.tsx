import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, MapPin, Clock, Plus, X, AlertCircle, Image as ImageIcon, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Header from "@/components/Header";
import { oficioService } from "@/services/oficioService";
import { servicioService } from "@/services/servicioService";
import { usuarioService } from "@/services/usuarioService";
import { Oficio, PortafolioRequest, ServicioUpdate } from "@/types/servicio.types";
import { diasSemana, validarDisponibilidad } from "@/utils/validation";
import { useToast } from "@/hooks/use-toast";

interface DisponibilidadDia {
  dia: string;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
}

interface Especialidad {
  id: string;
  nombre: string;
}

interface PortafolioForm {
  id: string;
  titulo: string;
  descripcion: string;
}

type OpcionImagen = 'mantener' | 'nueva' | 'ninguna';

const EditarServicio = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [oficios, setOficios] = useState<Oficio[]>([]);
  const [oficioSeleccionado, setOficioSeleccionado] = useState<string>("");
  const [cargandoOficios, setCargandoOficios] = useState(true);
  const [cargandoServicio, setCargandoServicio] = useState(true);
  
  const [descripcion, setDescripcion] = useState("");
  const [tarifaHora, setTarifaHora] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  
  const [cargandoImagen, setCargandoImagen] = useState(true);
  const [tieneImagenPerfil, setTieneImagenPerfil] = useState(false);
  const [imagenPerfilUrl, setImagenPerfilUrl] = useState<string | null>(null);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<OpcionImagen>('mantener');
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadDia[]>(
    diasSemana.map(dia => ({
      dia: dia.value,
      horaInicio: "09:00",
      horaFin: "18:00",
      activo: false
    }))
  );
  
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState("");
  
  const [portafolios, setPortafolios] = useState<PortafolioForm[]>([]);
  
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarOficios();
    cargarImagenPerfil();
    if (id) {
      cargarServicio(parseInt(id));
    }
  }, [id]);

  const cargarOficios = async () => {
    try {
      setCargandoOficios(true);
      const data = await oficioService.ListarTodos();
      setOficios(data);
    } catch (err) {
      console.error("Error al cargar oficios:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los oficios disponibles"
      });
    } finally {
      setCargandoOficios(false);
    }
  };

  const cargarImagenPerfil = async () => {
    try {
      setCargandoImagen(true);
      const data = await usuarioService.obtenerImagenPerfil();
      
      setTieneImagenPerfil(data.tieneImagen);
      
      if (data.tieneImagen && data.imagen && data.imagenTipo) {
        const url = usuarioService.construirImagenUrl(data.imagen, data.imagenTipo);
        setImagenPerfilUrl(url);
        setOpcionSeleccionada('mantener');
      } else {
        setOpcionSeleccionada('nueva');
      }
    } catch (err) {
      console.error("Error al cargar imagen de perfil:", err);
    } finally {
      setCargandoImagen(false);
    }
  };

  const cargarServicio = async (servicioId: number) => {
    try {
      setCargandoServicio(true);
      const servicio = await servicioService.obtenerPorId(servicioId);
      
      setOficioSeleccionado(servicio.oficioId.toString());
      setDescripcion(servicio.descripcion || "");
      setTarifaHora(servicio.tarifaHora?.toString() || "");
      setExperiencia(servicio.experiencia.toString());
      setUbicacion(servicio.ubicacion);
      
      const disponibilidadCargada = diasSemana.map(dia => {
        const horario = servicio.disponibilidad[dia.value];
        if (horario) {
          const [inicio, fin] = horario.split('-');
          return {
            dia: dia.value,
            horaInicio: inicio,
            horaFin: fin,
            activo: true
          };
        }
        return {
          dia: dia.value,
          horaInicio: "09:00",
          horaFin: "18:00",
          activo: false
        };
      });
      setDisponibilidad(disponibilidadCargada);
      
      const especialidadesCargadas = servicio.especialidades.map((esp, idx) => ({
        id: `esp-${idx}`,
        nombre: esp
      }));
      setEspecialidades(especialidadesCargadas);
      
      const portafoliosCargados = servicio.portafolios.map(port => ({
        id: port.id.toString(),
        titulo: port.titulo,
        descripcion: port.descripcion
      }));
      setPortafolios(portafoliosCargados);
      
    } catch (err) {
      console.error("Error al cargar servicio:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar el servicio"
      });
      navigate("/dashboard");
    } finally {
      setCargandoServicio(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Formato no válido",
        description: "Solo se permiten imágenes JPG, PNG, GIF o WEBP"
      });
      return;
    }
    
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Archivo muy grande",
        description: "La imagen no debe superar los 10MB"
      });
      return;
    }
    
    setImagenFile(file);
    setOpcionSeleccionada('nueva');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagenPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const eliminarImagenNueva = () => {
    setImagenFile(null);
    setImagenPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleDiaDisponibilidad = (dia: string) => {
    setDisponibilidad(prev =>
      prev.map(d => d.dia === dia ? { ...d, activo: !d.activo } : d)
    );
  };

  const actualizarHorario = (dia: string, tipo: 'inicio' | 'fin', valor: string) => {
    setDisponibilidad(prev =>
      prev.map(d => {
        if (d.dia === dia) {
          return tipo === 'inicio' 
            ? { ...d, horaInicio: valor }
            : { ...d, horaFin: valor };
        }
        return d;
      })
    );
  };

  const agregarEspecialidad = () => {
    if (!nuevaEspecialidad.trim()) return;
    
    if (especialidades.length >= 10) {
      toast({
        variant: "destructive",
        title: "Límite alcanzado",
        description: "Máximo 10 especialidades permitidas"
      });
      return;
    }
    
    if (nuevaEspecialidad.length > 50) {
      toast({
        variant: "destructive",
        title: "Especialidad muy larga",
        description: "Máximo 50 caracteres por especialidad"
      });
      return;
    }
    
    setEspecialidades([
      ...especialidades,
      { id: Date.now().toString(), nombre: nuevaEspecialidad.trim() }
    ]);
    setNuevaEspecialidad("");
  };

  const eliminarEspecialidad = (id: string) => {
    setEspecialidades(especialidades.filter(e => e.id !== id));
  };

  const agregarPortafolio = () => {
    setPortafolios([
      ...portafolios,
      { id: Date.now().toString(), titulo: "", descripcion: "" }
    ]);
  };

  const actualizarPortafolio = (id: string, campo: 'titulo' | 'descripcion', valor: string) => {
    setPortafolios(prev =>
      prev.map(p => p.id === id ? { ...p, [campo]: valor } : p)
    );
  };

  const eliminarPortafolio = (id: string) => {
    setPortafolios(portafolios.filter(p => p.id !== id));
  };

  const validarFormulario = (): string | null => {
    if (!oficioSeleccionado) {
      return "Debes seleccionar un oficio";
    }

    if (!ubicacion.trim()) {
      return "La ubicación es requerida";
    }

    if (ubicacion.length > 150) {
      return "La ubicación no puede exceder 150 caracteres";
    }

    if (!experiencia) {
      return "Los años de experiencia son requeridos";
    }

    const expNum = parseInt(experiencia);
    if (isNaN(expNum) || expNum < 0 || expNum > 50) {
      return "La experiencia debe estar entre 0 y 50 años";
    }

    if (especialidades.length === 0) {
      return "Debes agregar al menos una especialidad";
    }

    const diasActivos = disponibilidad.filter(d => d.activo);
    if (diasActivos.length === 0) {
      return "Debes seleccionar al menos un día de disponibilidad";
    }

    const disponibilidadObj: { [key: string]: string } = {};
    diasActivos.forEach(dia => {
      disponibilidadObj[dia.dia] = `${dia.horaInicio}-${dia.horaFin}`;
    });

    const errorDisponibilidad = validarDisponibilidad(disponibilidadObj);
    if (errorDisponibilidad) {
      return errorDisponibilidad;
    }

    if (tarifaHora && parseFloat(tarifaHora) <= 0) {
      return "La tarifa debe ser mayor a 0";
    }

    if (descripcion && descripcion.length > 400) {
      return "La descripción no puede exceder 400 caracteres";
    }

    for (const portafolio of portafolios) {
      if (!portafolio.titulo.trim() || !portafolio.descripcion.trim()) {
        return "Todos los portafolios deben tener título y descripción";
      }
      if (portafolio.titulo.length > 100) {
        return "El título del portafolio no puede exceder 100 caracteres";
      }
      if (portafolio.descripcion.length > 200) {
        return "La descripción del portafolio no puede exceder 200 caracteres";
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    if (!id) {
      setError("ID de servicio no válido");
      return;
    }

    try {
      setEnviando(true);

      const disponibilidadObj: { [key: string]: string } = {};
      disponibilidad
        .filter(d => d.activo)
        .forEach(dia => {
          disponibilidadObj[dia.dia] = `${dia.horaInicio}-${dia.horaFin}`;
        });

      const portafoliosData: PortafolioRequest[] = portafolios
        .filter(p => p.titulo.trim() && p.descripcion.trim())
        .map(p => ({
          titulo: p.titulo.trim(),
          descripcion: p.descripcion.trim()
        }));

      const servicioData: ServicioUpdate = {
        oficioId: parseInt(oficioSeleccionado),
        descripcion: descripcion.trim() || undefined,
        tarifaHora: tarifaHora ? parseFloat(tarifaHora) : undefined,
        disponibilidad: disponibilidadObj,
        experiencia: parseInt(experiencia),
        especialidades: especialidades.map(e => e.nombre),
        ubicacion: ubicacion.trim(),
        portafolios: portafoliosData.length > 0 ? portafoliosData : undefined,
        imagenOpcion: opcionSeleccionada 
      };

      console.log("Actualizando servicio:", servicioData);
      
      let imagenAEnviar: File | undefined;
      if (opcionSeleccionada === 'nueva' && imagenFile) {
        imagenAEnviar = imagenFile;
      }

      console.log("Con imagen:", imagenAEnviar?.name);

      await servicioService.actualizar(parseInt(id), servicioData, imagenAEnviar);

      toast({
        title: "¡Éxito!",
        description: "Tu servicio ha sido actualizado correctamente"
      });

      navigate("/dashboard");

    } catch (err: any) {
      console.error("Error al actualizar servicio:", err);
      const mensajeError = err.response?.data?.mensaje 
        || err.response?.data?.errores
        || "Ocurrió un error al actualizar el servicio";

      setError(typeof mensajeError === 'string' 
        ? mensajeError 
        : JSON.stringify(mensajeError));

      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el servicio"
      });
    } finally {
      setEnviando(false);
    }
  };

  if (cargandoServicio || cargandoOficios || cargandoImagen) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a Mis Servicios
          </Link>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="bg-serviceCard">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-card-foreground">
                Editar Servicio
              </CardTitle>
              <CardDescription>
                Actualiza la información de tu servicio profesional
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Imagen de Perfil */}
                <Card className="bg-background">
                  <CardHeader>
                    <CardTitle className="text-base">Imagen de Perfil</CardTitle>
                    <CardDescription>
                      Esta imagen se mostrará en todos tus servicios
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {tieneImagenPerfil && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Tienes una imagen de perfil cargada. Puedes mantenerla, cambiarla o no usar ninguna.
                        </AlertDescription>
                      </Alert>
                    )}

                    <RadioGroup
                      value={opcionSeleccionada}
                      onValueChange={(value) => setOpcionSeleccionada(value as OpcionImagen)}
                      className="space-y-3"
                    >
                      {tieneImagenPerfil && (
                        <div className="flex items-start space-x-3 p-4 border rounded-lg bg-serviceCard">
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

                      <div className="flex items-start space-x-3 p-4 border rounded-lg bg-serviceCard">
                        <RadioGroupItem value="nueva" id="nueva" className="mt-1" />
                        <div className="flex-1 space-y-3">
                          <Label htmlFor="nueva" className="cursor-pointer font-medium">
                            {tieneImagenPerfil ? "Usar una nueva imagen" : "Agregar imagen"}
                          </Label>
                          
                          {opcionSeleccionada === 'nueva' && (
                            <>
                              {imagenPreview ? (
                                <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                                  <img
                                    src={imagenPreview}
                                    alt="Nueva imagen"
                                    className="w-full h-full object-cover"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1"
                                    onClick={eliminarImagenNueva}
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
                                onChange={handleImageChange}
                                className="hidden"
                              />
                              
                              {!imagenPreview && (
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

                      <div className="flex items-start space-x-3 p-4 border rounded-lg bg-serviceCard">
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

                {/* Selección de Oficio */}
                <div className="space-y-2">
                  <Label htmlFor="oficio">Oficio / Profesión *</Label>
                  <Select
                    value={oficioSeleccionado}
                    onValueChange={setOficioSeleccionado}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecciona tu oficio" />
                    </SelectTrigger>
                    <SelectContent>
                      {oficios.map(oficio => (
                        <SelectItem key={oficio.id} value={oficio.id.toString()}>
                          {oficio.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ubicación */}
                <div className="space-y-2">
                  <Label htmlFor="ubicacion">Ubicación *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="ubicacion"
                      type="text"
                      placeholder="Ciudad, Provincia"
                      className="bg-background pl-10"
                      value={ubicacion}
                      onChange={(e) => setUbicacion(e.target.value)}
                      maxLength={150}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{ubicacion.length}/150 caracteres</p>
                </div>

                {/* Experiencia y Tarifa */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experiencia">Años de Experiencia *</Label>
                    <Input
                      id="experiencia"
                      type="number"
                      placeholder="10"
                      className="bg-background"
                      value={experiencia}
                      onChange={(e) => setExperiencia(e.target.value)}
                      min="0"
                      max="50"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tarifa">Tarifa por Hora (ARS)</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="tarifa"
                        type="number"
                        placeholder="2500"
                        className="bg-background pl-10"
                        value={tarifaHora}
                        onChange={(e) => setTarifaHora(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción de tus Servicios</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describe tu experiencia y servicios que ofreces..."
                    className="bg-background min-h-[100px]"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    maxLength={400}
                  />
                  <p className="text-xs text-muted-foreground">{descripcion.length}/400 caracteres</p>
                </div>

                {/* Disponibilidad */}
                <div className="space-y-3">
                  <Label>Disponibilidad *</Label>
                  <div className="space-y-3">
                    {diasSemana.map(dia => {
                      const diaData = disponibilidad.find(d => d.dia === dia.value);
                      if (!diaData) return null;
                      
                      return (
                        <div key={dia.value} className="flex items-center gap-3">
                          <Checkbox
                            id={`dia-${dia.value}`}
                            checked={diaData.activo}
                            onCheckedChange={() => toggleDiaDisponibilidad(dia.value)}
                          />
                          <Label htmlFor={`dia-${dia.value}`} className="w-24 cursor-pointer">
                            {dia.label}
                          </Label>
                          
                          {diaData.activo && (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                type="time"
                                value={diaData.horaInicio}
                                onChange={(e) => actualizarHorario(dia.value, 'inicio', e.target.value)}
                                className="bg-background w-32"
                              />
                              <span className="text-muted-foreground">a</span>
                              <Input
                                type="time"
                                value={diaData.horaFin}
                                onChange={(e) => actualizarHorario(dia.value, 'fin', e.target.value)}
                                className="bg-background w-32"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Especialidades */}
                <div className="space-y-3">
                  <Label>Especialidades *</Label>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ej: Instalación eléctrica residencial"
                      className="bg-background"
                      value={nuevaEspecialidad}
                      onChange={(e) => setNuevaEspecialidad(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarEspecialidad())}
                      maxLength={50}
                    />
                    <Button
                      type="button"
                      onClick={agregarEspecialidad}
                      disabled={!nuevaEspecialidad.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {especialidades.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {especialidades.map(esp => (
                        <div
                          key={esp.id}
                          className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                        >
                          <span>{esp.nombre}</span>
                          <button
                            type="button"
                            onClick={() => eliminarEspecialidad(esp.id)}
                            className="hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {especialidades.length}/10 especialidades
                  </p>
                </div>

                {/* Portafolios */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Portafolio de Trabajos</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={agregarPortafolio}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar Trabajo
                    </Button>
                  </div>
                  
                  {portafolios.length > 0 && (
                    <div className="space-y-4">
                      {portafolios.map((portafolio, index) => (
                        <Card key={portafolio.id} className="bg-background">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm">Trabajo #{index + 1}</CardTitle>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => eliminarPortafolio(portafolio.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor={`port-titulo-${portafolio.id}`}>Título</Label>
                              <Input
                                id={`port-titulo-${portafolio.id}`}
                                placeholder="Ej: Instalación Sistema Eléctrico Comercial"
                                className="bg-serviceCard"
                                value={portafolio.titulo}
                                onChange={(e) => actualizarPortafolio(portafolio.id, 'titulo', e.target.value)}
                                maxLength={100}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`port-desc-${portafolio.id}`}>Descripción</Label>
                              <Textarea
                                id={`port-desc-${portafolio.id}`}
                                placeholder="Describe el trabajo realizado..."
                                className="bg-serviceCard min-h-[80px]"
                                value={portafolio.descripcion}
                                onChange={(e) => actualizarPortafolio(portafolio.id, 'descripcion', e.target.value)}
                                maxLength={200}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    className="flex-1"
                    disabled={enviando}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-workerButton hover:bg-workerButton/90 text-workerButton-text"
                    disabled={enviando}
                  >
                    {enviando ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EditarServicio;