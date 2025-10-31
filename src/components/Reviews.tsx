import { useState, useEffect } from "react";
import { Star, MessageCircle, Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { reviewService } from "../services/reviewService";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import {
  ReviewCliente,
  ElegibilidadReviewResponse,
  CreateReviewClienteRequest,
  CreateReviewPrestadorRequest
} from "../types/review.types";

interface ReviewsProps {
  servicioId: number;
  presupuestoId?: number; // Opcional, solo si el usuario tiene un presupuesto con este servicio
  workerName: string;
}

const Reviews = ({ servicioId, presupuestoId, workerName }: ReviewsProps) => {
  // Estado para las reseñas
  const [reviews, setReviews] = useState<ReviewCliente[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  
  // Estado para nueva reseña
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Estado para respuestas del prestador
  const [responseTexts, setResponseTexts] = useState<{[key: number]: string}>({});
  
  // Estado de elegibilidad
  const [elegibilidad, setElegibilidad] = useState<ElegibilidadReviewResponse | null>(null);
  
  // Estado de carga y errores
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Obtener usuario actual del store de Redux
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const usuarioId = useSelector((state: RootState) => state.auth.usuarioId);
  const isProvider = currentUser?.rol === 'PRESTADOR';

  // Cargar reseñas al montar el componente
  useEffect(() => {
    cargarReviews();
  }, [servicioId]);

  // Verificar elegibilidad si hay presupuestoId
  useEffect(() => {
    if (presupuestoId && !isProvider) {
      verificarElegibilidad();
    }
  }, [presupuestoId, isProvider]);

  const cargarReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reviewService.obtenerReviewsServicio(servicioId);
      setReviews(data.reviews);
      setAverageRating(data.promedioValoracion);
      setTotalReviews(data.totalReviews);
    } catch (err: any) {
      console.error("Error al cargar reseñas:", err);
      setError("Error al cargar las reseñas");
    } finally {
      setLoading(false);
    }
  };

  const verificarElegibilidad = async () => {
    if (!presupuestoId) return;
    
    try {
      const data = await reviewService.verificarElegibilidad(servicioId, presupuestoId);
      setElegibilidad(data);
      console.log('📋 Elegibilidad:', data);
    } catch (err: any) {
      console.error("Error al verificar elegibilidad:", err);
    }
  };

  const renderStars = (rating: number, interactive = false, size = "w-5 h-5") => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const isFilled = interactive 
        ? starNumber <= (hoveredStar || newRating)
        : starNumber <= rating;
      
      return (
        <Star
          key={index}
          className={`${size} transition-colors ${
            interactive ? 'cursor-pointer' : ''
          } ${
            isFilled ? "text-yellow-500 fill-current" : "text-gray-300"
          }`}
          onClick={() => interactive && setNewRating(starNumber)}
          onMouseEnter={() => interactive && setHoveredStar(starNumber)}
          onMouseLeave={() => interactive && setHoveredStar(0)}
        />
      );
    });
  };

  const handleSubmitReview = async () => {
    if (!newReview.trim() || newRating === 0 || !presupuestoId) return;

    try {
      setSubmitting(true);
      setError(null);
      
      const request: CreateReviewClienteRequest = {
        idServicio: servicioId,
        idPresupuesto: presupuestoId,
        comentario: newReview.trim(),
        valoracion: newRating
      };

      await reviewService.crearReviewCliente(request);
      
      // Recargar reseñas
      await cargarReviews();
      
      // Limpiar formulario
      setNewReview("");
      setNewRating(0);
      setShowReviewForm(false);
      setSuccessMessage("¡Reseña publicada exitosamente!");
      
      // Actualizar elegibilidad
      await verificarElegibilidad();
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err: any) {
      console.error("Error al crear reseña:", err);
      const errorMessage = err.response?.data?.mensaje || "Error al publicar la reseña";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProviderResponse = async (reviewId: number) => {
    const responseText = responseTexts[reviewId];
    if (!responseText?.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      
      const request: CreateReviewPrestadorRequest = {
        idReviewCliente: reviewId,
        comentario: responseText.trim()
      };

      await reviewService.crearRespuestaPrestador(request);
      
      // Recargar reseñas
      await cargarReviews();
      
      // Limpiar campo de respuesta
      setResponseTexts({ ...responseTexts, [reviewId]: "" });
      setSuccessMessage("¡Respuesta publicada exitosamente!");
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err: any) {
      console.error("Error al responder reseña:", err);
      const errorMessage = err.response?.data?.mensaje || "Error al publicar la respuesta";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <Card className="bg-serviceCard">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Cargando reseñas...</p>
        </CardContent>
      </Card>
    );
  }

  const puedeRevisar = !isProvider && elegibilidad?.puedeRevisar;
  const yaRevisado = reviews.some(review => review.idCliente === usuarioId);

  console.log('🔍 Debug Reviews:', {
    presupuestoId,
    isProvider,
    elegibilidad,
    puedeRevisar,
    yaRevisado,
    usuarioId
  });

  return (
    <div className="space-y-6">
      {/* Mensajes de éxito/error */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Mensaje de elegibilidad para clientes */}
      {!isProvider && elegibilidad && !elegibilidad.puedeRevisar && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{elegibilidad.mensaje}</AlertDescription>
        </Alert>
      )}

      {/* Card principal de reseñas */}
      <Card className="bg-serviceCard">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">Reseñas de Clientes</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">{renderStars(averageRating)}</div>
                <span className="font-semibold text-lg">{averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({totalReviews} reseñas)</span>
              </div>
            </div>
            
            {puedeRevisar && !yaRevisado && (
              <Button 
                onClick={() => setShowReviewForm(!showReviewForm)}
                variant="outline"
              >
                Escribir reseña
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Formulario de nueva reseña */}
          {showReviewForm && puedeRevisar && !yaRevisado && (
            <Card className="bg-background/50">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Escribir reseña para {workerName}</h4>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-2">Calificación</label>
                  <div className="flex">{renderStars(0, true)}</div>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-2">Comentario</label>
                  <Textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="Comparte tu experiencia con este prestador..."
                    rows={3}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {newReview.length}/1000 caracteres
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmitReview}
                    disabled={!newReview.trim() || newRating === 0 || submitting}
                  >
                    {submitting ? "Publicando..." : "Publicar reseña"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowReviewForm(false);
                      setNewReview("");
                      setNewRating(0);
                    }}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de reseñas */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="bg-background/30">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-semibold">
                        {review.nombreCliente || `Cliente #${review.idCliente}`}
                      </h5>
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(review.valoracion, false, "w-4 h-4")}</div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.fecha)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-card-foreground mb-3">{review.comentario}</p>
                  
                  {/* Respuesta del prestador */}
                  {review.respuestaPrestador && (
                    <div className="ml-4 p-3 bg-primary/10 rounded-lg border-l-4 border-primary">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">Respuesta del prestador</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.respuestaPrestador.fecha)}
                        </span>
                      </div>
                      <p className="text-sm">{review.respuestaPrestador.comentario}</p>
                    </div>
                  )}
                  
                  {/* Formulario de respuesta para prestador */}
                  {isProvider && !review.respuestaPrestador && (
                    <div className="ml-4 mt-3 p-3 bg-background/50 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Responder a esta reseña</span>
                      </div>
                      <div className="flex gap-2">
                        <Textarea
                          value={responseTexts[review.id] || ""}
                          onChange={(e) => setResponseTexts({
                            ...responseTexts,
                            [review.id]: e.target.value
                          })}
                          placeholder="Responde a tu cliente..."
                          rows={2}
                          className="flex-1"
                          maxLength={1000}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleProviderResponse(review.id)}
                          disabled={!responseTexts[review.id]?.trim() || submitting}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {reviews.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aún no hay reseñas para este prestador</p>
              <p className="text-sm">¡Sé el primero en dejar una reseña!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reviews;