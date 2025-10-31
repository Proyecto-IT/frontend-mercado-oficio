// src/services/reviewService.ts
import { apiClient } from './apiClient';
import {
  ReviewCliente,
  ReviewPrestador,
  CreateReviewClienteRequest,
  CreateReviewPrestadorRequest,
  ReviewsResponse,
  ElegibilidadReviewResponse
} from '../types/review.types';

const REVIEWS_BASE_URL = '/api/reviews';

export const reviewService = {
  /**
   * Verifica si un cliente puede dejar una reseña para un servicio
   */
  async verificarElegibilidad(
    idServicio: number,
    idPresupuesto: number
  ): Promise<ElegibilidadReviewResponse> {
    const response = await apiClient.get<ElegibilidadReviewResponse>(
      `${REVIEWS_BASE_URL}/elegibilidad`,
      {
        params: { idServicio, idPresupuesto }
      }
    );
    return response.data;
  },

  /**
   * Crea una nueva reseña de cliente
   */
  async crearReviewCliente(
    data: CreateReviewClienteRequest
  ): Promise<ReviewCliente> {
    const response = await apiClient.post<ReviewCliente>(
      `${REVIEWS_BASE_URL}/cliente`,
      data
    );
    return response.data;
  },

  /**
   * Crea una respuesta del prestador a una reseña
   */
  async crearRespuestaPrestador(
    data: CreateReviewPrestadorRequest
  ): Promise<ReviewPrestador> {
    const response = await apiClient.post<ReviewPrestador>(
      `${REVIEWS_BASE_URL}/prestador`,
      data
    );
    return response.data;
  },

  /**
   * Obtiene todas las reseñas de un servicio con estadísticas
   */
  async obtenerReviewsServicio(idServicio: number): Promise<ReviewsResponse> {
    const response = await apiClient.get<ReviewsResponse>(
      `${REVIEWS_BASE_URL}/servicio/${idServicio}`
    );
    return response.data;
  },

  /**
   * Obtiene una reseña específica por ID
   */
  async obtenerReviewPorId(idReview: number): Promise<ReviewCliente> {
    const response = await apiClient.get<ReviewCliente>(
      `${REVIEWS_BASE_URL}/${idReview}`
    );
    return response.data;
  }
};