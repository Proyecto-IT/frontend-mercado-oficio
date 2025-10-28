import { useState } from "react";
import { MessageCircle, FileText, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface ServiceBookingProps {
  workerId: string;
  workerName: string;
  serviceName: string;
  servicioId: string;
  hourlyRate: number;
  isRequested?: boolean;
}

const ServiceBooking = ({ 
  workerId, 
  workerName, 
  serviceName, 
  servicioId,
  hourlyRate, 
  isRequested = false 
}: ServiceBookingProps) => {
  const [showBookingCard, setShowBookingCard] = useState(isRequested);

  if (!showBookingCard) {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold text-card-foreground mb-1">
                ¿Quieres este servicio?
              </h3>
              <p className="text-muted-foreground text-sm">
                Solicita un presupuesto a {workerName} para {serviceName}
              </p>
            </div>
            <div className="flex gap-2">
              <Link to={`/presupuesto/solicitar/${servicioId}`}>
                <Button className="bg-primary hover:bg-primary/90">
                  <FileText className="w-4 h-4 mr-2" />
                  Solicitar Presupuesto
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Presupuesto Solicitado
              </Badge>
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Has solicitado presupuesto para {serviceName} con {workerName}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Estado: Pendiente de respuesta</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Tarifa: ${hourlyRate} por hora</span>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Link to={`/chat/${workerId}`} className="flex-1">
            <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chatear con {workerName}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceBooking;