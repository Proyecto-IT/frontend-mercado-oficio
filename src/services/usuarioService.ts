// src/services/usuarioService.ts
import { apiClient } from './apiClient';

export interface ImagenPerfilResponse {
  tieneImagen: boolean;
  imagen: string | null;
  imagenTipo: string | null;
}

export interface ActualizarImagenResponse {
  mensaje: string;
  imagen: string;
  imagenTipo: string;
  advertencia: string;
}

class UsuarioService {
  /**
   * Obtiene la imagen de perfil del usuario autenticado
   */
  async obtenerImagenPerfil(): Promise<ImagenPerfilResponse> {
    const response = await apiClient.get<ImagenPerfilResponse>('/api/usuario/me/imagen');
    return response.data;
  }

  /**
   * Actualiza la imagen de perfil del usuario
   * Esta imagen se reflejará en TODOS los servicios del usuario
   */
  async actualizarImagenPerfil(imagen: File): Promise<ActualizarImagenResponse> {
    const formData = new FormData();
    formData.append('imagen', imagen);

    const response = await apiClient.put<ActualizarImagenResponse>(
      '/api/usuario/me/imagen',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Elimina la imagen de perfil del usuario
   */
  async eliminarImagenPerfil(): Promise<{ mensaje: string; advertencia: string }> {
    const response = await apiClient.delete<{ mensaje: string; advertencia: string }>(
      '/api/usuario/me/imagen'
    );
    return response.data;
  }

  /**
   * Construye la URL de data URI para mostrar la imagen
   */
  construirImagenUrl(imagen: string, imagenTipo: string): string {
    return `data:${imagenTipo};base64,${imagen}`;
  }
}

export const usuarioService = new UsuarioService();