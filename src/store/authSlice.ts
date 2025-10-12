// src/store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
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

// Cargar estado inicial desde sessionStorage
const loadInitialState = (): AuthState => {
  try {
    const savedAuth = sessionStorage.getItem('auth');
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      console.log('📦 Estado cargado desde sessionStorage:', {
        hasToken: !!parsed.accessToken,
        usuarioId: parsed.usuarioId,
        user: parsed.user?.gmail
      });
      return {
        ...parsed,
        isAuthenticated: !!parsed.accessToken,
      };
    }
  } catch (error) {
    console.error('❌ Error loading auth state:', error);
  }
  
  console.log('🆕 Iniciando con estado vacío');
  return {
    accessToken: null,
    usuarioId: null,
    user: null,
    isAuthenticated: false,
  };
};

// 🔥 Helper para persistir estado
const persistState = (state: AuthState) => {
  try {
    sessionStorage.setItem('auth', JSON.stringify(state));
    console.log('💾 Estado persistido:', {
      hasToken: !!state.accessToken,
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
      user?: User; // 🔥 OPCIONAL
    }>) => {
      const { accessToken, usuarioId, user } = action.payload;
      
      console.log('🔐 setCredentials:', {
        tokenPreview: accessToken.substring(0, 20) + '...',
        usuarioId,
        userEmail: user?.gmail || 'sin user'
      });
      
      state.accessToken = accessToken;
      state.usuarioId = usuarioId;
      
      // 🔥 Solo actualizar user si viene en el payload
      if (user) {
        state.user = user;
      }
      
      state.isAuthenticated = true;
      
      // Persistir en sessionStorage
      persistState(state);
    },
        
    setUser: (state, action: PayloadAction<User>) => {
      console.log('👤 setUser:', action.payload.gmail);
      
      state.user = action.payload;
      
      // Persistir cambios
      persistState(state);
    },
    
    updateAccessToken: (state, action: PayloadAction<string>) => {
      const newToken = action.payload;
      
      console.log('🔄 updateAccessToken:', {
        oldTokenPreview: state.accessToken?.substring(0, 20) + '...',
        newTokenPreview: newToken.substring(0, 20) + '...',
        changed: state.accessToken !== newToken
      });
      
      // 🔥 CRÍTICO: Actualizar el token
      state.accessToken = newToken;
      
      // 🔥 Mantener isAuthenticated en true si hay token
      if (newToken) {
        state.isAuthenticated = true;
      }
      
      // Persistir cambios INMEDIATAMENTE
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