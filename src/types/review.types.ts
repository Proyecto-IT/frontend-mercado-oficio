export interface ReviewCliente {
  id: number;
  idCliente: number;
  idServicio: number;
  idPresupuesto: number;
  comentario: string;
  valoracion: number;
  fecha: string;
  respuestaPrestador?: ReviewPrestador;
  nombreCliente?: string;
}

export interface ReviewPrestador {
  id: number;
  idPrestador: number;
  idReviewCliente: number;
  comentario: string;
  fecha: string;
  nombrePrestador?: string;
}

export interface CreateReviewClienteRequest {
  idServicio: number;
  idPresupuesto: number;
  comentario: string;
  valoracion: number;
}

export interface CreateReviewPrestadorRequest {
  idReviewCliente: number;
  comentario: string;
}

export interface ReviewsResponse {
  reviews: ReviewCliente[];
  promedioValoracion: number;
  totalReviews: number;
}

export interface ElegibilidadReviewResponse {
  puedeRevisar: boolean;
  mensaje: string;
  idPresupuesto?: number;
}