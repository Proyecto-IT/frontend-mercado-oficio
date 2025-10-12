import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { logout as logoutAction } from '../store/authSlice';
import { authService } from '../services/authService';

/**
 * Hook personalizado para manejar el logout de forma centralizada
 */
export const useLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const logout = useCallback(async (options?: { 
    redirect?: boolean;
    reason?: 'manual' | 'expired' | 'error';
  }) => {
    const { redirect = true, reason = 'manual' } = options || {};
    
    console.log(`🚪 Ejecutando logout (razón: ${reason})`);

    try {
      // 1. Llamar al backend para invalidar el refresh token
      await authService.logout();
      
      console.log('✅ Token invalidado en servidor');
    } catch (error) {
      console.warn('⚠️ Error al invalidar token en servidor:', error);
      // Continuar de todos modos con el logout local
    }

    // 2. Limpiar el estado local
    dispatch(logoutAction());
    
    console.log('✅ Estado local limpiado');

    // 3. Redirigir al login si es necesario
    if (redirect) {
      const searchParams = new URLSearchParams();
      
      if (reason === 'expired') {
        searchParams.set('session', 'expired');
      } else if (reason === 'error') {
        searchParams.set('session', 'error');
      }
      
      //const path = searchParams.toString() 
      //  ? `/login?${searchParams.toString()}` 
      //  : '/login';
      
      //console.log('🔀 Redirigiendo a:', path);
      //navigate(path, { replace: true });
    }
  }, [dispatch, navigate]);

  return logout;
};

export default useLogout;