// src/services/portafolioService.ts

import { apiClient } from './apiClient';
import { PortafolioRequest, PortafolioResponse } from '@/types/servicio.types';

export const portafolioService = {
  // Crear portafolio
  crear: async (servicioId: number, data: PortafolioRequest): Promise<PortafolioResponse> => {
    const response = await apiClient.post<PortafolioResponse>(
      `/api/portafolios/servicio/${servicioId}`, 
      data
    );
    return response.data;
  },
  
  // Actualizar portafolio
  actualizar: async (id: number, data: Partial<PortafolioRequest>): Promise<PortafolioResponse> => {
    const response = await apiClient.put<PortafolioResponse>(`/api/portafolios/${id}`, data);
    return response.data;
  },
  
  // Eliminar portafolio
  eliminar: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/portafolios/${id}`);
  },
  
  // Obtener portafolio por ID
  obtenerPorId: async (id: number): Promise<PortafolioResponse> => {
    const response = await apiClient.get<PortafolioResponse>(`/api/portafolios/${id}`);
    return response.data;
  },
  
  // Obtener portafolios por servicio
  obtenerPorServicio: async (servicioId: number): Promise<PortafolioResponse[]> => {
    const response = await apiClient.get<PortafolioResponse[]>(
      `/api/portafolios/servicio/${servicioId}`
    );
    return response.data;
  }
};