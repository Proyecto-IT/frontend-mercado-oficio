import { apiClient } from '@/services/apiClient';

export interface Oficio {
  id: number;
  nombre: string;
}

export interface OficioCreateRequest {
  nombre: string;
}

export interface OficioUpdateRequest {
  id: number;
  nombre: string;
}

class OficioService {
  private readonly BASE_URL = '/api/oficios';

  /**
   * Obtiene todos los oficios
   */
  async ListarTodos(): Promise<Oficio[]> {
    console.log('🔵 Llamando GET', this.BASE_URL);
    try {
      const response = await apiClient.get<Oficio[]>(this.BASE_URL);
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
  async BuscarPorNombre(nombre: string): Promise<Oficio[]> {
    console.log('🔵 Llamando GET /buscar con nombre:', nombre);
    try {
      const response = await apiClient.get<Oficio[]>(`${this.BASE_URL}/buscar`, {
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
  async create(data: OficioCreateRequest): Promise<Oficio> {
    console.log('🔵 Llamando POST', this.BASE_URL, 'con datos:', data);
    try {
      const response = await apiClient.post<Oficio>(this.BASE_URL, data);
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
  async update(data: OficioUpdateRequest): Promise<Oficio> {
    console.log('🔵 Llamando PUT', this.BASE_URL, 'con datos:', data);
    try {
      const response = await apiClient.put<Oficio>(this.BASE_URL, data);
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
export const oficioService = new OficioService();