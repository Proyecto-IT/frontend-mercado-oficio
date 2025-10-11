// src/pages/Auth.tsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import { apiClient } from '@/services/apiClient';
import { authService } from '@/services/authService';
import { setCredentials, setUser } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Obtener la página de origen, excluyendo rutas no permitidas
  const from = location.state?.from?.pathname;
  const excludedPaths = ['/auth', '/validate-email', '/worker/register'];
  const isExcludedPath = (path: string) => {
    return excludedPaths.some(excluded => path?.startsWith(excluded)) || path === '/404';
  };
  const redirectPath = (from && !isExcludedPath(from)) ? from : "/";

  // Estados de login
  const [loginData, setLoginData] = useState({
    gmail: "",
    password: ""
  });

  // Estados de registro con nombre y apellido
  const [registerData, setRegisterData] = useState({
    nombre: "",
    apellido: "",
    gmail: "",
    password: "",
    confirmPassword: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!loginData.gmail || !loginData.password) {
      setError("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Login y obtener tokens
      const data = await authService.login(loginData.gmail, loginData.password);
      
      console.log('✅ Login exitoso, accessToken recibido');

      // 2. 🔥 CRÍTICO: Guardar el token INMEDIATAMENTE antes de cualquier otra llamada
      dispatch(setCredentials({
        accessToken: data.accessToken,
        usuarioId: data.usuarioId,
      }));

      // 3. ⏳ Esperar un poco para que el store se actualice
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log('📡 Obteniendo información del usuario...');

      // 4. Ahora sí obtener info del usuario (usará el token del store)
      const userInfo = await authService.getUserInfo();
      
      console.log('✅ UserInfo obtenido:', userInfo.gmail);

      // 5. Actualizar solo el user (sin duplicar token/usuarioId)
      dispatch(setUser(userInfo));

      setSuccess("¡Inicio de sesión exitoso!");
      setTimeout(() => navigate(redirectPath, { replace: true }), 1000);
      
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      
      if (err.message.includes("no verificado")) {
        setError("Usuario no verificado. Por favor verifica tu email.");
      } else if (err.message.includes("Credenciales inválidas")) {
        setError("Credenciales inválidas. Verifica tu email y contraseña.");
      } else if (err.message.includes("Google")) {
        setError("Debes iniciar sesión con Google para esta cuenta.");
      } else {
        setError(err.message || "Error al iniciar sesión");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!registerData.nombre || !registerData.apellido || !registerData.gmail || !registerData.password || !registerData.confirmPassword) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (registerData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      // ✅ Pasar un objeto en lugar de parámetros individuales
      const message = await authService.register({
        nombre: registerData.nombre,
        apellido: registerData.apellido,
        gmail: registerData.gmail,
        password: registerData.password
      });
      
      setSuccess(message);

      // Limpiar formulario
      setRegisterData({
        nombre: "",
        apellido: "",
        gmail: "",
        password: "",
        confirmPassword: ""
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Error al registrar usuario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver al inicio
          </Link>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="bg-serviceCard">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Bienvenido a Mercado Oficio
              </CardTitle>
              <CardDescription>
                Ingresa a tu cuenta o crea una nueva para comenzar
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="mb-4 border-green-500 text-green-700 bg-green-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="register">Registrarse</TabsTrigger>
                </TabsList>

                {/* Login */}
                <TabsContent value="login" className="space-y-4 mt-6">
                  <form onSubmit={handleLogin}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="tu@email.com"
                          className="bg-background"
                          value={loginData.gmail}
                          onChange={(e) => setLoginData({...loginData, gmail: e.target.value})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Tu contraseña"
                            className="bg-background pr-12"
                            value={loginData.password}
                            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 bottom-1 px-3"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="text-right">
                        <a href="#" className="text-sm text-primary hover:underline">
                          ¿Olvidaste tu contraseña?
                        </a>
                      </div>

                      <Button 
                        type="submit"
                        className="w-full bg-workerButton hover:bg-workerButton/90 text-workerButton-text"
                        size="lg"
                        disabled={isLoading}
                      >
                        {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                {/* Registro */}
                <TabsContent value="register" className="space-y-4 mt-6">
                  <form onSubmit={handleRegister}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                          id="nombre"
                          type="text"
                          placeholder="Tu nombre"
                          className="bg-background"
                          value={registerData.nombre}
                          onChange={(e) => setRegisterData({...registerData, nombre: e.target.value})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="apellido">Apellido</Label>
                        <Input
                          id="apellido"
                          type="text"
                          placeholder="Tu apellido"
                          className="bg-background"
                          value={registerData.apellido}
                          onChange={(e) => setRegisterData({...registerData, apellido: e.target.value})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registerEmail">Email</Label>
                        <Input
                          id="registerEmail"
                          type="email"
                          placeholder="tu@email.com"
                          className="bg-background"
                          value={registerData.gmail}
                          onChange={(e) => setRegisterData({...registerData, gmail: e.target.value})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registerPassword">Contraseña</Label>
                        <div className="relative">
                          <Input
                            id="registerPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Mínimo 8 caracteres"
                            className="bg-background pr-12"
                            value={registerData.password}
                            onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 bottom-1 px-3"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirma tu contraseña"
                            className="bg-background pr-12"
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 bottom-1 px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Al registrarte, aceptas nuestros{" "}
                        <a href="#" className="text-primary hover:underline">Términos de Servicio</a> y{" "}
                        <a href="#" className="text-primary hover:underline">Política de Privacidad</a>
                      </div>

                      <Button 
                        type="submit"
                        className="w-full bg-workerButton hover:bg-workerButton/90 text-workerButton-text"
                        size="lg"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                ¿Eres un profesional?{" "}
                <Link to="/worker/register" className="text-primary hover:underline font-medium">
                  Registra tu servicio aquí
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;