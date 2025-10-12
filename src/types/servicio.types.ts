// src/types/servicio.types.ts

export interface Oficio {
  id: number;
  nombre: string;
}

export interface PortafolioRequest {
  titulo: string;
  descripcion: string;
}

export interface PortafolioResponse {
  id: number;
  servicioId: number;
  titulo: string;
  descripcion: string;
}

// NOTA: imagenUrl ya no es string, ahora manejamos archivos
export interface ServicioRequest {
  oficioId: number;
  descripcion?: string;
  tarifaHora?: number;
  disponibilidad: {
    [dia: string]: string;
  };
  experiencia: number;
  especialidades: string[];
  ubicacion: string;
  portafolios?: PortafolioRequest[];
}

export interface ServicioResponse {
  id: number;
  usuarioId: number;
  oficioId: number;
  nombreOficio: string;
  descripcion?: string;
  tarifaHora?: number;
  disponibilidad: {
    [dia: string]: string;
  };
  experiencia: number;
  especialidades: string[];
  ubicacion: string;
  trabajosCompletados: number;
  imagenUrl?: string;
  portafolios: PortafolioResponse[];
  rolActualizado?: boolean;
  nuevoRol?: 'CLIENTE' | 'TRABAJADOR' | 'ADMIN' | 'DESCONOCIDO';
  nombreTrabajador?: string;
  apellidoTrabajador?: string;
  emailTrabajador?: string;
}

export interface ServicioUpdate {
  oficioId?: number;
  descripcion?: string;
  tarifaHora?: number;
  disponibilidad?: {
    [dia: string]: string;
  };
  experiencia?: number;
  especialidades?: string[];
  ubicacion?: string;
  portafolios?: PortafolioRequest[];
}
