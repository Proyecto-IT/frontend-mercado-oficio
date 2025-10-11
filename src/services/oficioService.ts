import { apiClient } from '@/services/apiClient';

export interface Occupation {
  id: number;
  nombre: string;
}

export interface OccupationCreateRequest {
  nombre: string;
}

export interface OccupationUpdateRequest {
  id: number;
  nombre: string;
}

class OccupationService {
  private readonly BASE_URL = '/api/oficios';

  /**
   * Obtiene todos los oficios
   */
  async getAll(): Promise<Occupation[]> {
    console.log('🔵 Llamando GET', this.BASE_URL);
    try {
      const response = await apiClient.get<Occupation[]>(this.BASE_URL);
      console.log('✅ Respuesta GET:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error GET:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Busca oficios por nombre
   */
  async searchByName(nombre: string): Promise<Occupation[]> {
    console.log('🔵 Llamando GET /buscar con nombre:', nombre);
    try {
      const response = await apiClient.get<Occupation[]>(`${this.BASE_URL}/buscar`, {
        params: { nombre }
      });
      console.log('✅ Respuesta búsqueda:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error búsqueda:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Crea un nuevo oficio
   */
  async create(data: OccupationCreateRequest): Promise<Occupation> {
    console.log('🔵 Llamando POST', this.BASE_URL, 'con datos:', data);
    try {
      const response = await apiClient.post<Occupation>(this.BASE_URL, data);
      console.log('✅ Respuesta POST:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error POST:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Actualiza un oficio existente
   */
  async update(data: OccupationUpdateRequest): Promise<Occupation> {
    console.log('🔵 Llamando PUT', this.BASE_URL, 'con datos:', data);
    try {
      const response = await apiClient.put<Occupation>(this.BASE_URL, data);
      console.log('✅ Respuesta PUT:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error PUT:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Elimina un oficio por ID
   */
  async delete(id: number): Promise<void> {
    console.log('🔵 Llamando DELETE', this.BASE_URL, 'con id:', id);
    try {
      await apiClient.delete(`${this.BASE_URL}`, {
        params: { id }
      });
      console.log('✅ Oficio eliminado correctamente');
    } catch (error: any) {
      console.error('❌ Error DELETE:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Exportar una instancia única del servicio
export const occupationService = new OccupationService();