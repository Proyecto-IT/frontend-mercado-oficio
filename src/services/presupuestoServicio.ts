// presupuestoServicio.ts
import {
  PresupuestoServicioDTO,
  PresupuestoServicioCreateDTO,
  PresupuestoServicioUpdateDTO,
  PresupuestoArchivoDTO,
  EstadoPresupuesto,
} from "@/types/presupuesto.types";
import { apiClient } from "@/services/apiClient";

const API_BASE_URL = "/api/presupuestos";

export const presupuestoServicio = {
  // Crear presupuesto
  crear(dto: PresupuestoServicioCreateDTO): Promise<PresupuestoServicioDTO> {
    return apiClient
      .post(API_BASE_URL, dto)
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error al crear presupuesto:", error);
        throw error;
      });
  },

  // Obtener presupuesto por ID
  obtener(id: number): Promise<PresupuestoServicioDTO> {
    return apiClient
      .get(`${API_BASE_URL}/${id}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error al obtener presupuesto:", error);
        throw error;
      });
  },

  // Obtener presupuestos del cliente
  obtenerPorCliente(idCliente: number): Promise<PresupuestoServicioDTO[]> {
    return apiClient
      .get(`${API_BASE_URL}/cliente/${idCliente}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error al obtener presupuestos del cliente:", error);
        throw error;
      });
  },

  // Obtener presupuestos del prestador
  obtenerPorPrestador(idPrestador: number): Promise<PresupuestoServicioDTO[]> {
    return apiClient
      .get(`${API_BASE_URL}/prestador/${idPrestador}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error al obtener presupuestos del prestador:", error);
        throw error;
      });
  },

  // Obtener presupuestos por estado
  obtenerPorEstado(estado: EstadoPresupuesto): Promise<PresupuestoServicioDTO[]> {
    return apiClient
      .get(`${API_BASE_URL}/estado/${estado}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error al obtener presupuestos por estado:", error);
        throw error;
      });
  },

  // Actualizar presupuesto
  actualizar(
    id: number,
    dto: PresupuestoServicioUpdateDTO
  ): Promise<PresupuestoServicioDTO> {
    return apiClient
      .put(`${API_BASE_URL}/${id}`, dto)
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error al actualizar presupuesto:", error);
        throw error;
      });
  },
   /**
   * Actualiza el estado de un presupuesto
   */
  // Actualiza el estado de un presupuesto
actualizarEstado(
  id: number,
  estado: EstadoPresupuesto
): Promise<PresupuestoServicioDTO> {
  return apiClient
    .patch(`${API_BASE_URL}/${id}/estado`, { estado })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error al actualizar estado del presupuesto:", error);
      throw error;
    });
},

  // Eliminar presupuesto
  eliminar(id: number): Promise<void> {
    return apiClient
      .delete(`${API_BASE_URL}/${id}`)
      .then(() => {})
      .catch((error) => {
        console.error("Error al eliminar presupuesto:", error);
        throw error;
      });
  },

  // Cargar archivo
  cargarArchivo(
    presupuestoId: number,
    archivo: File
  ): Promise<PresupuestoArchivoDTO> {
    const formData = new FormData();
    formData.append("archivo", archivo);

    return apiClient
      .post(`${API_BASE_URL}/${presupuestoId}/archivos`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error al cargar archivo:", error);
        throw error;
      });
  },

  // Obtener archivos del presupuesto (sin contenido)
  obtenerArchivos(presupuestoId: number): Promise<PresupuestoArchivoDTO[]> {
    return apiClient
      .get(`${API_BASE_URL}/${presupuestoId}/archivos`)
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error al obtener archivos:", error);
        throw error;
      });
  },

  // Obtener imagen específica por ID
  obtenerImagen(archivoId: number): Promise<Blob> {
    return apiClient
      .get(`${API_BASE_URL}/archivos/${archivoId}/descargar`, {
        responseType: 'blob'
      })
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error al obtener imagen:", error);
        throw error;
      });
  },

  // Eliminar archivo
  eliminarArchivo(archivoId: number): Promise<void> {
    return apiClient
      .delete(`${API_BASE_URL}/archivos/${archivoId}`)
      .then(() => {})
      .catch((error) => {
        console.error("Error al eliminar archivo:", error);
        throw error;
      });
  },
  // Verificar si el presupuesto ya fue respondido
  estaRespondido(presupuestoId: number): Promise<boolean> {
    return apiClient
      .get(`${API_BASE_URL}/${presupuestoId}/respondido`)
      .then((response) => response.data.respondido)
      .catch((error) => {
        console.error("Error al verificar si fue respondido:", error);
        throw error;
      });
  },
  // Obtener presupuestos por servicio
obtenerPorServicio(servicioId: number): Promise<PresupuestoServicioDTO[]> {
  return apiClient
    .get(`${API_BASE_URL}/servicio/${servicioId}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error al obtener presupuestos del servicio:", error);
      throw error;
    });
},
};

export default presupuestoServicio;