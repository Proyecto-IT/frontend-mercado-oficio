// src/store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  nombre: string;
  apellido: string;
  gmail: string;
  rol: string;
}

interface AuthState {
  accessToken: string | null;
  usuarioId: number | null;
  user: User | null;
  isAuthenticated: boolean;
}

// ✅ FUNCIÓN DE VALIDACIÓN JWT
const isValidJWT = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

// Cargar estado inicial desde sessionStorage
const loadInitialState = (): AuthState => {
  try {
    const savedAuth = sessionStorage.getItem('auth');
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      
      // ✅ VALIDAR TOKEN AL CARGAR
      if (parsed.accessToken && !isValidJWT(parsed.accessToken)) {
        console.error('❌ Token corrupto en sessionStorage, limpiando...');
        sessionStorage.removeItem('auth');
        return {
          accessToken: null,
          usuarioId: null,
          user: null,
          isAuthenticated: false,
        };
      }
      
      console.log('📦 Estado cargado desde sessionStorage:', {
        hasToken: !!parsed.accessToken,
        tokenValid: parsed.accessToken ? isValidJWT(parsed.accessToken) : false,
        usuarioId: parsed.usuarioId,
        user: parsed.user?.gmail
      });
      
      return {
        ...parsed,
        isAuthenticated: !!parsed.accessToken && isValidJWT(parsed.accessToken),
      };
    }
  } catch (error) {
    console.error('❌ Error loading auth state:', error);
    sessionStorage.removeItem('auth');
  }
  
  console.log('🆕 Iniciando con estado vacío');
  return {
    accessToken: null,
    usuarioId: null,
    user: null,
    isAuthenticated: false,
  };
};

// Helper para persistir estado
const persistState = (state: AuthState) => {
  try {
    sessionStorage.setItem('auth', JSON.stringify(state));
    console.log('💾 Estado persistido:', {
      hasToken: !!state.accessToken,
      tokenValid: state.accessToken ? isValidJWT(state.accessToken) : false,
      tokenPreview: state.accessToken?.substring(0, 20) + '...',
      usuarioId: state.usuarioId,
      user: state.user?.gmail
    });
  } catch (error) {
    console.error('❌ Error saving auth state:', error);
  }
};

const initialState: AuthState = loadInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{
      accessToken: string;
      usuarioId: number;
      user?: User;
    }>) => {
      const { accessToken, usuarioId, user } = action.payload;
      
      // ✅ VALIDACIÓN CRÍTICA: Verificar token antes de guardarlo
      if (!isValidJWT(accessToken)) {
        console.error('❌ Intentando guardar token inválido en setCredentials:', {
          tokenParts: accessToken.split('.').length,
          tokenPreview: accessToken.substring(0, 50) + '...',
          tokenLength: accessToken.length
        });
        return; // No guardar token inválido
      }
      
      console.log('🔐 setCredentials con token válido:', {
        tokenPreview: accessToken.substring(0, 20) + '...',
        tokenParts: accessToken.split('.').length,
        usuarioId,
        userEmail: user?.gmail || 'sin user'
      });
      
      state.accessToken = accessToken;
      state.usuarioId = usuarioId;
      
      if (user) {
        state.user = user;
      }
      
      state.isAuthenticated = true;
      persistState(state);
    },
        
    setUser: (state, action: PayloadAction<User>) => {
      console.log('👤 setUser:', action.payload.gmail);
      state.user = action.payload;
      persistState(state);
    },
    
    updateAccessToken: (state, action: PayloadAction<string>) => {
      const newToken = action.payload;
      
      // ✅ VALIDACIÓN CRÍTICA: Verificar token antes de guardarlo
      if (!isValidJWT(newToken)) {
        console.error('❌ Intentando actualizar con token inválido:', {
          tokenParts: newToken.split('.').length,
          tokenPreview: newToken.substring(0, 50) + '...',
          tokenLength: newToken.length
        });
        return; // No actualizar con token inválido
      }
      
      console.log('🔄 updateAccessToken con token válido:', {
        oldTokenPreview: state.accessToken?.substring(0, 20) + '...',
        newTokenPreview: newToken.substring(0, 20) + '...',
        newTokenParts: newToken.split('.').length,
        changed: state.accessToken !== newToken
      });
      
      state.accessToken = newToken;
      
      if (newToken) {
        state.isAuthenticated = true;
      }
      
      persistState(state);
    },
    
    logout: (state) => {
      console.log('🚪 logout: Limpiando estado de autenticación');
      
      state.accessToken = null;
      state.usuarioId = null;
      state.user = null;
      state.isAuthenticated = false;
      
      // Limpiar sessionStorage
      try {
        sessionStorage.removeItem('auth');
        console.log('✅ sessionStorage limpiado');
      } catch (error) {
        console.error('❌ Error clearing auth state:', error);
      }
    },
  },
});

export const { setCredentials, setUser, updateAccessToken, logout } = authSlice.actions;

// Selectors
import type { RootState } from './store';

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectUsuarioId = (state: RootState) => state.auth.usuarioId;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsAdmin = (state: RootState) => state.auth.user?.rol === 'ADMIN';
export const selectIsWorker = (state: RootState) => state.auth.user?.rol === 'TRABAJADOR';

export default authSlice.reducer;