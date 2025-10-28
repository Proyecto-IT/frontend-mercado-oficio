// src/services/apiClient.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '../store/store';
import { updateAccessToken, logout } from '../store/authSlice';

const API_URL = import.meta.env.VITE_API_URL;
console.log("API URL:", API_URL);

interface RefreshResponse {
  accessToken: string;
  usuarioId: number;
}

// Variable para evitar múltiples refreshes simultáneos
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Endpoints públicos que no necesitan token
const PUBLIC_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/verify-email',
  '/api/auth/forgot-password',
  '/api/auth/reset-password'
];

const isPublicEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// ✅ FUNCIÓN CRÍTICA: Validar formato JWT
const isValidJWT = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Un JWT válido debe tener exactamente 3 partes separadas por puntos
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// INTERCEPTOR DE REQUEST
// ==========================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // No agregar token a endpoints públicos
    if (isPublicEndpoint(config.url)) {
      return config;
    }

    const state = store.getState();
    const token = state.auth.accessToken;
    
    if (token) {
      // ✅ VALIDACIÓN CRÍTICA: Verificar formato del token
      if (!isValidJWT(token)) {
        console.error('❌ Token inválido en store:', {
          url: config.url,
          tokenParts: token.split('.').length,
          tokenPreview: token.substring(0, 50) + '...',
          tokenLength: token.length,
          fullToken: token // Para debug
        });
        
        // Hacer logout si el token está corrupto
        console.error('🚨 Limpiando token corrupto y haciendo logout...');
        store.dispatch(logout());
        
        return Promise.reject(new Error('Token JWT inválido en store'));
      }
      
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('📤 Request con token válido:', {
        url: config.url,
        tokenPreview: token.substring(0, 20) + '...',
        tokenParts: token.split('.').length
      });
    } else {
      console.warn('⚠️ No hay token disponible para:', config.url);
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// ==========================================
// INTERCEPTOR DE RESPONSE
// ==========================================
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // No intentar refresh en endpoints públicos
    if (isPublicEndpoint(originalRequest?.url)) {
      return Promise.reject(error);
    }
    
    const status = error.response?.status;
    
    // Manejar 401 directamente (token definitivamente inválido)
    if (status === 401 && !originalRequest._retry) {
      console.log('❌ 401 Unauthorized - Token inválido o expirado');
      
      if (originalRequest._retry) {
        console.log('🚪 Refresh ya falló, haciendo logout...');
        store.dispatch(logout());
        return Promise.reject(error);
      }
    }
    
    // Solo intentar refresh en 403 (Forbidden)
    if (status === 403 && !originalRequest._retry) {
      // Si ya hay un refresh en curso, encolar
      if (isRefreshing) {
        console.log('⏳ Refresh en progreso, encolando petición...');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        })
        .catch(err => {
          console.error('❌ Error al procesar petición encolada');
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 Token inválido/expirado, intentando refresh...');
        
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
        
        // ✅ VALIDACIÓN CRÍTICA: Verificar el nuevo token
        if (!isValidJWT(data.accessToken)) {
          console.error('❌ Nuevo token recibido es inválido:', {
            tokenParts: data.accessToken.split('.').length,
            tokenPreview: data.accessToken.substring(0, 50) + '...',
            fullToken: data.accessToken // Para debug
          });
          throw new Error('Token JWT inválido recibido del servidor');
        }
        
        console.log('✅ Token refrescado exitosamente');
        console.log('🔑 Nuevo access token:', data.accessToken.substring(0, 20) + '...');
        console.log('✅ Token tiene', data.accessToken.split('.').length, 'partes (correcto)');
        
        // Actualizar solo el access token
        store.dispatch(updateAccessToken(data.accessToken));
        
        // Pequeña espera para asegurar que el store se actualizó
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Procesar la cola de peticiones fallidas
        processQueue(null, data.accessToken);
        
        // Reintentar la petición original con el nuevo token
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        }
        
        console.log('🔁 Reintentando petición original:', originalRequest.url);
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        console.error('❌ Error al refrescar token:', refreshError);
        
        const axiosError = refreshError as AxiosError;
        const errorStatus = axiosError.response?.status;
        
        if (errorStatus === 401) {
          console.log('🚪 Refresh token inválido o expirado, haciendo logout...');
        } else {
          console.log('🚪 Error al refrescar, haciendo logout...');
        }
        
        // Procesar la cola con error
        processQueue(axiosError, null);
        
        // Hacer logout
        store.dispatch(logout());
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

// Exportar también la función de validación por si se necesita en otros lugares
export { apiClient, API_URL, isValidJWT };