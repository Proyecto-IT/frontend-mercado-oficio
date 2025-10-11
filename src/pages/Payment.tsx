import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Building, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface ServiceDetails {
  workerId: string;
  workerName: string;
  serviceName: string;
  description: string;
  hourlyRate: number;
  estimatedHours: number;
}

const Payment = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    estimatedHours: 2
  });

  // Mock service details - replace with actual data
  const serviceDetails: ServiceDetails = {
    workerId: workerId || "1",
    workerName: "Carlos Mendoza",
    serviceName: "Carpintería",
    description: "Construcción de mueble a medida para sala",
    hourlyRate: 2500,
    estimatedHours: formData.estimatedHours
  };

  const total = serviceDetails.hourlyRate * serviceDetails.estimatedHours;
  const platformFee = total * 0.05; // 5% platform fee
  const finalTotal = total + platformFee;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Here you would integrate with your payment processor (Stripe, MercadoPago, etc.)
      // For now, we'll simulate the payment process
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "¡Pago exitoso!",
        description: "El servicio ha sido contratado. El trabajador se pondrá en contacto contigo.",
      });
      
      // Redirect to chat with the worker
      navigate(`/chat/${workerId}`);
      
    } catch (error) {
      toast({
        title: "Error en el pago",
        description: "Hubo un problema procesando tu pago. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">Contratar Servicio</h1>
            <p className="text-muted-foreground">Completa el pago para confirmar tu servicio</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Payment Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Método de Pago</CardTitle>
                <CardDescription>
                  Selecciona tu método de pago preferido
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="w-4 h-4" />
                      Tarjeta de Crédito/Débito
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer">
                      <Building className="w-4 h-4" />
                      Transferencia Bancaria
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="mobile" id="mobile" />
                    <Label htmlFor="mobile" className="flex items-center gap-2 cursor-pointer">
                      <Smartphone className="w-4 h-4" />
                      Pago Móvil
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {paymentMethod === "card" && (
              <Card>
                <CardHeader>
                  <CardTitle>Datos de la Tarjeta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Fecha de Vencimiento</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/AA"
                          value={formData.expiryDate}
                          onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={(e) => handleInputChange("cvv", e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="cardName">Nombre en la Tarjeta</Label>
                      <Input
                        id="cardName"
                        placeholder="Juan Pérez"
                        value={formData.cardName}
                        onChange={(e) => handleInputChange("cardName", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Servicio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Trabajador:</span>
                    <span>{serviceDetails.workerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Servicio:</span>
                    <span>{serviceDetails.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Descripción:</span>
                    <span className="text-right text-sm">{serviceDetails.description}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="hours">Horas Estimadas</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="1"
                      value={formData.estimatedHours}
                      onChange={(e) => handleInputChange("estimatedHours", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Tarifa por hora:</span>
                    <span>${serviceDetails.hourlyRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal ({serviceDetails.estimatedHours}h):</span>
                    <span>${total}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Comisión de plataforma (5%):</span>
                    <span>${platformFee.toFixed(2)}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• El pago se procesará una vez que confirmes la contratación</p>
                  <p>• Podrás chatear con el trabajador inmediatamente</p>
                  <p>• El dinero se liberará al trabajador una vez completado el servicio</p>
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? "Procesando..." : `Pagar $${finalTotal.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;