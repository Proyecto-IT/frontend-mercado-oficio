// src/components/Header.tsx
import { Search, User, Menu, ChevronDown, LogOut, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { logout, selectIsAuthenticated, selectCurrentUser, selectIsAdmin } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { authService } from "@/services/authService";

const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Obtener datos del estado de Redux con hooks tipados
  const isLoggedIn = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const isAdmin = useAppSelector(selectIsAdmin);

  const handleLogout = async () => {
    try {
      // ✅ Usa authService.logout() en vez de dispatch(logout())
      await authService.logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error en logout:', error);
      navigate('/', { replace: true });
    }
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
                <DropdownMenuItem className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                  Carpintería
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                  Mecánica Automotriz
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                  Plomería
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                  Electricista
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                  Jardinería
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                  Limpieza
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                  Pintura
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                  Albañilería
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <a href="#" className="hover:text-primary transition-colors text-sm lg:text-base whitespace-nowrap hidden lg:inline">
              ¿Eres trabajador?
            </a>
            
            <a href="#" className="hover:text-primary transition-colors text-sm lg:text-base whitespace-nowrap hidden lg:inline">
              Ayuda
            </a>
            
            {/* Botón de admin - solo visible si el usuario es ADMIN */}
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
    </header>
  );
};

export default Header;