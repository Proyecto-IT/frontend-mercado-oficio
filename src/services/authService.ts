// src/services/authService.ts
import axios from 'axios';
import { apiClient, API_URL } from './apiClient';
import { store } from '../store/store';
import { logout } from '../store/authSlice';

// ==========================================
// TIPOS
// ==========================================

export interface LoginResponse {
  accessToken: string;
  usuarioId: number;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  gmail: string;
  password: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface UserInfo {
  nombre: string;
  apellido: string;
  gmail: string;
  rol: string;
}

// ==========================================
// SERVICIO DE AUTENTICACIÓN
// ==========================================

class AuthService {
  /**
   * Inicia sesión con email y contraseña
   */
  async login(gmail: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/api/auth/login', { 
      gmail, 
      password 
    });
    
    console.log('✅ Login exitoso, token recibido');
    console.log('🍪 Cookie de refresh token establecida por el backend');
    
    return data;
  }

  /**
   * Registra un nuevo usuario
   */
  async register(userData: RegisterRequest): Promise<string> {
    const { data } = await apiClient.post<string>('/api/auth/register', userData);
    console.log('✅ Usuario registrado exitosamente');
    return data;
  }

  /**
   * Obtiene la información del usuario autenticado
   */
  async getUserInfo(): Promise<UserInfo> {
    console.log('📡 Solicitando información del usuario...');
    
    const state = store.getState();
    console.log('🔍 Token actual en store:', state.auth.accessToken?.substring(0, 20) + '...');
    
    const { data } = await apiClient.get<UserInfo>('/api/auth/me');
    console.log('✅ Información del usuario obtenida:', data.nombre, data.gmail);
    
    return data;
  }

  /**
   * Refresca el access token usando el refresh token (cookie)
   * Nota: Este método usa axios directo para evitar los interceptores
   */
  async refreshToken(): Promise<RefreshResponse> {
    console.log('🔄 Solicitando refresh token...');
    
    // Usar axios directo para evitar interceptores
    const { data } = await axios.post<RefreshResponse>(
      `${API_URL}/api/auth/refresh`,
      {},
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Token refrescado manualmente');
    return data;
  }

  /**
   * Cierra la sesión del usuario
   * - Llama al backend para invalidar el refresh token
   * - Limpia el estado local (Redux)
   */
  async logout(): Promise<void> {
    try {
      console.log('🚪 Cerrando sesión...');
      
      // Llamar al backend para invalidar el refresh token
      await apiClient.post('/api/auth/logout');
      
      console.log('✅ Logout exitoso en el backend');
    } catch (error) {
      console.error('❌ Error al hacer logout en el backend:', error);
      // Continuar con el logout local aunque falle el backend
    } finally {
      // SIEMPRE limpia el store local
      store.dispatch(logout());
      console.log('🧹 Store local limpiado');
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const state = store.getState();
    return !!state.auth.accessToken;
  }

  /**
   * Obtiene el access token actual
   */
  getAccessToken(): string | null {
    const state = store.getState();
    return state.auth.accessToken;
  }
}

// Exportar una instancia única del servicio
export const authService = new AuthService();

// Exportación por defecto para compatibilidad
export default authService;