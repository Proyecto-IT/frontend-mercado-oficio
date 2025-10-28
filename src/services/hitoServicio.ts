// src/services/hitoServicio.ts
import { apiClient } from "./apiClient";  // ✅ Usar apiClient en lugar de axios
import { HitoDTO } from "@/types/hitos.types";
import { HorarioServicio } from "@/types/presupuesto.types";

const API_BASE_URL = "/api/hitos";

export interface CompletarHitoRequest {
  evidencia?: string;
  comentarios?: string;
}

export interface DisputaRequest {
  motivo: string;
  descripcion?: string;
}

export interface HitoResponseDTO {
  id: number;
  presupuestoId: number;
  numeroHito: number;
  descripcion: string;
  porcentajePresupuesto: number;
  monto: number;
  estado: string;
  fechaInicio: string;
  fechaFinalizacionEstimada: string;
  fechaCompletado?: string;
  escrowId: string;
}

export interface LiberarFondosResponseDTO {
  hitoId: number;
  monto: number;
  mensaje: string;
  estado: string;
}

export interface DisputaResponseDTO {
  hitoId: number;
  motivo: string;
  mensaje: string;
  estado: string;
}

export interface EstadoHitoDTO {
  hito: HitoDTO;
}

class HitoServicio {
  /**
   * Crea hitos automáticos para un presupuesto
   */
 async crearHitosAutomaticos(
  presupuestoId: number,
  horariosSeleccionados: HorarioServicio[]
): Promise<HitoResponseDTO[]> {
  try {
    console.log('🔨 Creando hitos:', {
      presupuestoId,
      horariosCount: horariosSeleccionados.length
    });
    
    // ✅ Enviar todo en el body
    const response = await apiClient.post(
      `${API_BASE_URL}/crear`,
      {
        presupuestoId,
        horariosSeleccionados
      }
    );
    
    console.log('✅ Hitos creados exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error al crear hitos automáticos:", error);
    throw error;
  }
}
  /**
   * Marca un hito como completado (prestador)
   */
  async completarHito(
    hitoId: number,
    request: CompletarHitoRequest
  ): Promise<HitoResponseDTO> {
    try {
      const response = await apiClient.put(
        `${API_BASE_URL}/${hitoId}/completar`,
        request
      );
      return response.data;
    } catch (error) {
      console.error("Error al completar hito:", error);
      throw error;
    }
  }

  /**
   * Aprueba un hito (cliente)
   */
  async aprobarHito(hitoId: number): Promise<HitoResponseDTO> {
    try {
      const response = await apiClient.put(
        `${API_BASE_URL}/${hitoId}/aprobar`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error("Error al aprobar hito:", error);
      throw error;
    }
  }

  /**
   * Libera los fondos de un hito (cliente)
   */
  async liberarFondos(hitoId: number): Promise<LiberarFondosResponseDTO> {
    try {
      const response = await apiClient.put(
        `${API_BASE_URL}/${hitoId}/liberar-fondos`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error("Error al liberar fondos:", error);
      throw error;
    }
  }

  /**
   * Levanta una disputa para un hito
   */
  async levantarDisputa(
    hitoId: number,
    request: DisputaRequest
  ): Promise<DisputaResponseDTO> {
    try {
      const response = await apiClient.post(
        `${API_BASE_URL}/${hitoId}/levantar-disputa`,
        request
      );
      return response.data;
    } catch (error) {
      console.error("Error al levantar disputa:", error);
      throw error;
    }
  }

  /**
   * Obtiene el estado de un hito
   */
  async obtenerEstado(hitoId: number): Promise<EstadoHitoDTO> {
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/${hitoId}/estado`
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener estado del hito:", error);
      throw error;
    }
  }

  /**
   * Obtiene todos los hitos de un presupuesto
   */
  async obtenerHitosPresupuesto(
    presupuestoId: number
  ): Promise<HitoResponseDTO[]> {
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/presupuesto/${presupuestoId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener hitos del presupuesto:", error);
      throw error;
    }
  }

  /**
   * Obtiene un hito específico
   */
  async obtenerHito(hitoId: number): Promise<HitoResponseDTO> {
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/${hitoId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener hito:", error);
      throw error;
    }
  }
  async obtenerHitosCliente(clienteId: number): Promise<HitoResponseDTO[]> {
  try {
    const response = await apiClient.get(
      `${API_BASE_URL}/cliente/${clienteId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener hitos del cliente:", error);
    throw error;
  }
}
}

export const hitoServicio = new HitoServicio();