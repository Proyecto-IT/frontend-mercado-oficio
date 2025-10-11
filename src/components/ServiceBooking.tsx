import { useState } from "react";
import { MessageCircle, CreditCard, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface ServiceBookingProps {
  workerId: string;
  workerName: string;
  serviceName: string;
  hourlyRate: number;
  isBooked?: boolean;
}

const ServiceBooking = ({ 
  workerId, 
  workerName, 
  serviceName, 
  hourlyRate, 
  isBooked = false 
}: ServiceBookingProps) => {
  const [showBookingCard, setShowBookingCard] = useState(isBooked);

  if (!showBookingCard) {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold text-card-foreground mb-1">
                ¿Quieres contratar este servicio?
              </h3>
              <p className="text-muted-foreground text-sm">
                Conecta directamente con {workerName} y agenda tu servicio
              </p>
            </div>
            <div className="flex gap-2">
              <Link to={`/payment/${workerId}`}>
                <Button className="bg-primary hover:bg-primary/90">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Contratar Servicio
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Servicio Contratado
              </Badge>
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Has contratado {serviceName} con {workerName}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-green-600" />
            <span>Estado: Pendiente de confirmación</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-green-600" />
            <span>Tarifa: ${hourlyRate} por hora</span>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Link to={`/chat/${workerId}`} className="flex-1">
            <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50">
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