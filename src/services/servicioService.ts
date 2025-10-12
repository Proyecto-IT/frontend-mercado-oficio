// src/services/servicioService.ts
import { apiClient } from './apiClient';
import { 
  ServicioRequest, 
  ServicioResponse, 
  ServicioUpdate 
} from '@/types/servicio.types';

export const servicioService = {
  // Crear servicio con archivo de imagen
  crear: async (data: ServicioRequest, imagenFile?: File): Promise<ServicioResponse> => {
    const formData = new FormData();
    
    // Agregar el JSON del servicio como string
    formData.append('servicio', JSON.stringify(data));
    
    // Agregar la imagen si existe
    if (imagenFile) {
      formData.append('imagen', imagenFile);
    }
    
    const response = await apiClient.post<ServicioResponse>('/api/servicios', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Actualizar servicio con archivo de imagen opcional
  actualizar: async (id: number, data: ServicioUpdate, imagenFile?: File): Promise<ServicioResponse> => {
    const formData = new FormData();
    
    formData.append('servicio', JSON.stringify(data));
    
    if (imagenFile) {
      formData.append('imagen', imagenFile);
    }
    
    const response = await apiClient.put<ServicioResponse>(`/api/servicios/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Eliminar servicio
  eliminar: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/servicios/${id}`);
  },
  
  // Obtener servicio por ID
  obtenerPorId: async (id: number): Promise<ServicioResponse> => {
    const response = await apiClient.get<ServicioResponse>(`/api/servicios/${id}`);
    return response.data;
  },
  
  // Obtener mis servicios
  obtenerMisServicios: async (): Promise<ServicioResponse[]> => {
    const response = await apiClient.get<ServicioResponse[]>('/api/servicios/mis-servicios');
    return response.data;
  },
  
  // Obtener servicios por usuario
  obtenerPorUsuario: async (usuarioId: number): Promise<ServicioResponse[]> => {
    const response = await apiClient.get<ServicioResponse[]>(`/api/servicios/usuario/${usuarioId}`);
    return response.data;
  },
  
  // Obtener servicios por oficio
  obtenerPorOficio: async (oficioId: number): Promise<ServicioResponse[]> => {
    const response = await apiClient.get<ServicioResponse[]>(`/api/servicios/oficio/${oficioId}`);
    return response.data;
  },
  
  // Obtener todos los servicios
  obtenerTodos: async (): Promise<ServicioResponse[]> => {
    const response = await apiClient.get<ServicioResponse[]>('/api/servicios');
    return response.data;
  }
};