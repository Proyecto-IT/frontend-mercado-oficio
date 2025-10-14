import { Search, User, Menu, ChevronDown, LogOut, FileText, Settings, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { logout, selectIsAuthenticated, selectCurrentUser, selectIsAdmin, selectIsWorker } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { authService } from "@/services/authService";
import { oficioService } from "@/services/oficioService";
import { Oficio } from "@/services/oficioService";

const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const isLoggedIn = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isWorker = useAppSelector(selectIsWorker);

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [oficios, setOficios] = useState<Oficio[]>([]);
  const [cargandoOficios, setCargandoOficios] = useState(true);

  useEffect(() => {
    cargarOficios();
  }, []);

  const cargarOficios = async () => {
    try {
      setCargandoOficios(true);
      const data = await oficioService.ListarTodos();
      setOficios(data);
    } catch (err) {
      console.error("Error al cargar oficios:", err);
    } finally {
      setCargandoOficios(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error en logout:', error);
      navigate('/', { replace: true });
    }
  };

  const handleWorkerActionClick = () => {
    if (!isLoggedIn) {
      setShowAuthDialog(true);
    } else if (isWorker) {
      navigate('/dashboard');
    } else {
      navigate('/worker/register');
    }
  };

  const handleOfficioClick = (oficio: Oficio) => {
    navigate(`/?filtroOficio=${encodeURIComponent(oficio.nombre)}`);
  };

  return (
    <header className="bg-header-bg text-header-text shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="text-xl md:text-2xl font-bold text-primary hover:text-primary/90 transition-colors whitespace-nowrap">
              Mercado Oficio
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Buscar servicios: carpintero, plomero, mecánico..."
                className="w-full pl-4 pr-12 py-3 rounded-full border-2 border-gray-200 focus:border-primary"
              />
              <Button 
                size="sm" 
                className="absolute right-1 top-1 bottom-1 px-4 rounded-full bg-primary hover:bg-primary/90"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center hover:text-primary transition-colors text-sm lg:text-base whitespace-nowrap">
                Servicios
                <ChevronDown className="w-4 h-4 ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-serviceCard border shadow-lg z-50">
                {cargandoOficios ? (
                  <DropdownMenuItem disabled>Cargando...</DropdownMenuItem>
                ) : oficios.length > 0 ? (
                  oficios.map(oficio => (
                    <DropdownMenuItem 
                      key={oficio.id}
                      className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleOfficioClick(oficio)}
                    >
                      {oficio.nombre}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No hay oficios disponibles</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {!isAdmin && (
              <button
                onClick={handleWorkerActionClick}
                className="hover:text-primary transition-colors text-sm lg:text-base whitespace-nowrap hidden lg:inline bg-transparent border-0 cursor-pointer flex items-center gap-1"
              >
                {isWorker ? (
                  <>
                    <span>Ver Mis Servicios</span>
                  </>
                ) : (
                  'Ser Trabajador'
                )}
              </button>
            )}
            
            <a href="#" className="hover:text-primary transition-colors text-sm lg:text-base whitespace-nowrap hidden lg:inline">
              Ayuda
            </a>
            
            {isAdmin && (
              <Link to="/admin/occupations">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground whitespace-nowrap"
                >
                  <Settings className="w-4 h-4 lg:mr-2" />
                  <span className="hidden lg:inline">Gestionar Oficios</span>
                </Button>
              </Link>
            )}
            
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-header-text text-header-text hover:bg-primary hover:text-primary-foreground whitespace-nowrap"
                  >
                    <User className="w-4 h-4 lg:mr-2" />
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border shadow-lg" align="end">
                  <DropdownMenuItem className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                    <User className="w-4 h-4 mr-2" />
                    Ver perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                    <FileText className="w-4 h-4 mr-2" />
                    Ver pedidos
                  </DropdownMenuItem>
                  {isWorker && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        onClick={() => navigate('/dashboard')}
                      >
                        <Briefcase className="w-4 h-4 mr-2" />
                        Mis Servicios
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-header-text text-header-text hover:bg-primary hover:text-primary-foreground whitespace-nowrap"
                >
                  <User className="w-4 h-4 lg:mr-2" />
                  <span className="hidden lg:inline">Ingresar</span>
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu */}
          <Button variant="ghost" className="md:hidden" size="sm">
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden mt-3">
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Buscar servicios..."
              className="w-full pl-4 pr-12 py-2 rounded-full border-2 border-gray-200 focus:border-primary text-sm"
            />
            <Button 
              size="sm" 
              className="absolute right-1 top-1 bottom-1 px-3 rounded-full bg-primary hover:bg-primary/90"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Autenticación requerida</AlertDialogTitle>
            <AlertDialogDescription>
              Para registrarte como trabajador, primero debes crear una cuenta e iniciar sesión como usuario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowAuthDialog(false);
              navigate('/auth');
            }}>
              Ir a Registro / Iniciar Sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
};

export default Header;