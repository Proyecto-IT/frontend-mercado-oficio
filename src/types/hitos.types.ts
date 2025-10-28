// hitos.types.ts
export interface HitoDTO {
  id: number;
  presupuestoId: number;
  numeroHito: number;
  descripcion: string;
  porcentajePresupuesto: number;
  monto: number;
  estado: EstadoHito;
  fechaInicio: string;
  fechaFinalizacionEstimada: string;
  fechaCompletado?: string;
  escrowId: string;
}

export enum EstadoHito {
  PENDIENTE = "PENDIENTE",
  EN_PROGRESO = "EN_PROGRESO",
  COMPLETADO = "COMPLETADO",
  APROBADO_CLIENTE = "APROBADO_CLIENTE",
  PAGADO = "PAGADO",
  DISPUTADO = "DISPUTADO",
  CANCELADO = "CANCELADO"
}

export interface ModificacionHitoDTO {
  id: number;
  hitoId: number;
  descripcionCambio: string;
  montoAnterior: number;
  montoNuevo: number;
  fechaInicioAnterior: string;
  fechaIniciNueva: string;
  estadoAprobacion: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  aprobadoCliente: boolean;
  aprobadoPrestador: boolean;
}