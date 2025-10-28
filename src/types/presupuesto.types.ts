// src/types/presupuesto.types.ts

export enum EstadoPresupuesto {
  PENDIENTE = "PENDIENTE",
  APROBADO = "APROBADO",
  RECHAZADO = "RECHAZADO"
}

export enum TipoArchivo {
  IMAGEN = "IMAGEN",
  VIDEO = "VIDEO"
}

export interface DisponibilidadHoraria {
  dia: string; // "LUNES", "MARTES", etc.
  horaInicio: string; // "09:00"
  horaFin: string; // "17:00"
}

export interface HorarioServicio {
  id?: number;
  fecha: string; // "2025-10-20"
  horaInicio: string; // "09:00"
  horaFin: string; // "12:00"
  duracionHoras: number; // 3
}

export interface PresupuestoArchivoDTO {
  id: number;
  nombreArchivo: string;
  contenido: Blob;
  tipoMime: string;
  tipoArchivo: TipoArchivo;
  tamaniomB: number;
  fechaCarga: string;
}
export interface PresupuestoServicioDTO {
  id: number;
  servicioId: number;
  idCliente: number;
  idPrestador: number;
  descripcionProblema: string;
  presupuesto: number;
  descripcionSolucion?: string;  // Opcional
  estado: EstadoPresupuesto;
  horasEstimadas?: number;  // Opcional
  costoMateriales?: number;  // Opcional
  archivos: PresupuestoArchivoDTO[];
  fechaCreacion: string;
  fechaActualizacion: string;
  tarifaHora?: string | number;  // Opcional
  nombreCliente: string;
  apellidoCliente: string;
  nombrePrestador: string;
  apellidoPrestador: string;
  respondido?: boolean;
  fechaRespuesta?: string;
  disponibilidad?: string;
  horariosSeleccionados?: HorarioServicio[];
}

export interface PresupuestoServicioCreateDTO {
  servicioId: number;
  idCliente: number;
  descripcionProblema: string;
}

export interface PresupuestoServicioUpdateDTO {
  idPrestador: number;
  horasEstimadas: number;
  costoMateriales: number;
  descripcionSolucion: string;
  estado?: EstadoPresupuesto;
  horariosSeleccionados?: HorarioServicio[]; // Nuevos horarios seleccionados
}

export interface PresupuestoArchivoCreateDTO {
  archivo: File;
}