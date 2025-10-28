import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

const ServiciosPagadosCard = () => {
  // TODO: Implementar la lógica para obtener servicios pagados
  // Por ahora mostramos un mensaje de placeholder

  return (
    <div className="text-center py-12">
      <Card className="max-w-md mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Package className="w-6 h-6" />
            Servicios Pagados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No tienes servicios pagados aún. Una vez que apruebes y pagues un presupuesto, aparecerá aquí.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiciosPagadosCard;
