import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ValidateEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token no proporcionado en la URL.");
      return;
    }

    // ⭐ CAMBIA ESTA URL
    const backendUrl = import.meta.env.VITE_API_URL;
    
    // ⭐ USA LA RUTA CORRECTA: /api/auth/validate
    fetch(`${backendUrl}/api/auth/validate?token=${token}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Token inválido o expirado");
        }
        return response.text();
      })
      .then((data) => {
        setStatus("success");
        setMessage(data || "Usuario validado correctamente.");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error.message || "Error al validar el email. Por favor, intenta nuevamente.");
      });
  }, [searchParams]);

  const handleGoToLogin = () => {
    navigate("/auth");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Logo/Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Mercado Oficio
          </h1>
          <p className="text-muted-foreground">Validación de Email</p>
        </div>

        {/* Card de Validación */}
        <div className="bg-card rounded-lg shadow-lg p-8">
          {status === "loading" && (
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
              <h2 className="text-xl font-semibold text-card-foreground">
                Validando tu email...
              </h2>
              <p className="text-muted-foreground">
                Por favor espera mientras verificamos tu cuenta.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <Alert variant="default" className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800 font-semibold">
                  ¡Verificación Exitosa!
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  {message}
                </AlertDescription>
              </Alert>

              <div className="text-center space-y-4">
                <CheckCircle2 className="h-20 w-20 text-green-600 mx-auto" />
                <h2 className="text-2xl font-bold text-card-foreground">
                  ¡Tu cuenta ha sido verificada!
                </h2>
                <p className="text-muted-foreground">
                  Ya puedes iniciar sesión y comenzar a usar Mercado Oficio.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleGoToLogin} 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  onClick={handleGoHome} 
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Ir al Inicio
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <Alert variant="destructive">
                <XCircle className="h-5 w-5" />
                <AlertTitle className="font-semibold">Error de Validación</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>

              <div className="text-center space-y-4">
                <XCircle className="h-20 w-20 text-destructive mx-auto" />
                <h2 className="text-2xl font-bold text-card-foreground">
                  No se pudo validar tu email
                </h2>
                <p className="text-muted-foreground">
                  El enlace puede haber expirado o ser inválido. Por favor, intenta registrarte nuevamente o contacta con soporte.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleGoHome} 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  Volver al Inicio
                </Button>
                <Button 
                  onClick={() => navigate("/auth")} 
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Ir a Registro
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          ¿Necesitas ayuda? Contacta con nuestro{" "}
          <a href="#" className="text-primary hover:underline font-medium">
            equipo de soporte
          </a>
        </p>
      </div>
    </div>
  );
};

export default ValidateEmail;
