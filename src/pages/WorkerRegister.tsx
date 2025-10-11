import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, MapPin, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";

const WorkerRegister = () => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const serviceCategories = [
    "Carpintería",
    "Plomería", 
    "Electricidad",
    "Mecánica",
    "Pintura",
    "Jardinería",
    "Limpieza",
    "Construcción"
  ];

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/auth" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver al registro
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-serviceCard">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-card-foreground">
                Registra tu Servicio Profesional
              </CardTitle>
              <CardDescription>
                Únete a Mercado Oficio y conecta con clientes que necesitan tus servicios
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Información Personal */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground">Información Personal</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Tu nombre"
                      className="bg-background"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Tu apellido"
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workerEmail">Email</Label>
                    <Input
                      id="workerEmail"
                      type="email"
                      placeholder="tu@email.com"
                      className="bg-background"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+54 9 11 1234 5678"
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="Ciudad, Provincia"
                      className="bg-background pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Servicios Profesionales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground">Servicios que Ofreces</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {serviceCategories.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={selectedServices.includes(service)}
                        onCheckedChange={() => handleServiceToggle(service)}
                      />
                      <Label 
                        htmlFor={service}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {service}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experiencia y Tarifas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground">Experiencia y Tarifas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Años de Experiencia</Label>
                    <Select>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecciona tu experiencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">Menos de 1 año</SelectItem>
                        <SelectItem value="1-3">1-3 años</SelectItem>
                        <SelectItem value="3-5">3-5 años</SelectItem>
                        <SelectItem value="5-10">5-10 años</SelectItem>
                        <SelectItem value="10+">Más de 10 años</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Tarifa por Hora (ARS)</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="hourlyRate"
                        type="number"
                        placeholder="2500"
                        className="bg-background pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción de tus Servicios</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe tu experiencia, especialidades y qué servicios ofreces..."
                    className="bg-background min-h-[100px]"
                  />
                </div>
              </div>

              {/* Foto de Perfil */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground">Foto de Perfil</h3>
                
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Sube una foto profesional tuya
                  </p>
                  <Button variant="outline" size="sm">
                    Seleccionar Archivo
                  </Button>
                </div>
              </div>

              {/* Portfolio */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground">Portfolio (Opcional)</h3>
                
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center">
                  <Star className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Sube fotos de trabajos realizados (máximo 5 imágenes)
                  </p>
                  <Button variant="outline" size="sm">
                    Agregar Fotos
                  </Button>
                </div>
              </div>

              {/* Términos y Condiciones */}
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox id="terms" />
                  <div className="text-xs text-muted-foreground">
                    <Label htmlFor="terms" className="font-medium">
                      Acepto los términos y condiciones
                    </Label>
                    <p className="mt-1">
                      Al registrarme como profesional, acepto los{" "}
                      <a href="#" className="text-primary hover:underline">
                        Términos de Servicio para Profesionales
                      </a>{" "}
                      y la{" "}
                      <a href="#" className="text-primary hover:underline">
                        Política de Privacidad
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-workerButton hover:bg-workerButton/90 text-workerButton-text"
                size="lg"
              >
                Registrar mi Servicio
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default WorkerRegister;