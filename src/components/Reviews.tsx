import { useState } from "react";
import { Star, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  providerResponse?: string;
  responseDate?: string;
}

interface ProviderReview {
  id: string;
  providerName: string;
  rating: number;
  comment: string;
  date: string;
  clientName: string;
}

interface ReviewsProps {
  workerId: string;
  workerName: string;
  averageRating: number;
  totalReviews: number;
  hasCompletedService?: boolean;
}

// Mock reviews data
const mockReviews: Review[] = [
  {
    id: "1",
    clientName: "María González",
    rating: 5,
    comment: "Excelente trabajo, muy profesional y puntual. Recomendado 100%.",
    date: "2024-01-15",
    providerResponse: "Muchas gracias María! Fue un placer trabajar en su proyecto.",
    responseDate: "2024-01-16"
  },
  {
    id: "2", 
    clientName: "Pedro López",
    rating: 4,
    comment: "Buen trabajo, aunque se demoró un poco más de lo esperado.",
    date: "2024-01-10",
    providerResponse: "Gracias Pedro, disculpas por la demora. Siempre busco entregar la mejor calidad.",
    responseDate: "2024-01-11"
  },
  {
    id: "3",
    clientName: "Ana Martínez",
    rating: 5,
    comment: "Perfecto! Superó mis expectativas. Muy detallista en su trabajo.",
    date: "2024-01-05"
  }
];

// Mock provider reviews for clients
const mockProviderReviews: ProviderReview[] = [
  {
    id: "1",
    providerName: "Carlos Mendoza",
    rating: 5,
    comment: "Cliente muy comunicativo y claro con sus requerimientos. Pago puntual.",
    date: "2024-01-16",
    clientName: "María González"
  },
  {
    id: "2",
    providerName: "Carlos Mendoza", 
    rating: 4,
    comment: "Buen cliente, aunque hubo algunos cambios de último momento.",
    date: "2024-01-12",
    clientName: "Pedro López"
  }
];

const Reviews = ({ workerId, workerName, averageRating, totalReviews, hasCompletedService = false }: ReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [providerReviews, setProviderReviews] = useState<ProviderReview[]>(mockProviderReviews);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [newProviderReview, setNewProviderReview] = useState("");
  const [newProviderRating, setNewProviderRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [hoveredProviderStar, setHoveredProviderStar] = useState(0);
  const [responseTexts, setResponseTexts] = useState<{[key: string]: string}>({});
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showProviderReviewForm, setShowProviderReviewForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'client' | 'provider'>('client');

  // Simular usuario autenticado
  const currentUser = { id: "user123", name: "Cliente Actual", isProvider: false };
  const hasReviewed = reviews.some(review => review.clientName === currentUser.name);
  const hasReviewedAsProvider = providerReviews.some(review => review.providerName === workerName);

  const renderStars = (rating: number, interactive = false, size = "w-5 h-5") => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const isFilled = interactive 
        ? starNumber <= (hoveredStar || newRating)
        : starNumber <= rating;
      
      return (
        <Star
          key={index}
          className={`${size} cursor-pointer transition-colors ${
            isFilled ? "text-yellow-500 fill-current" : "text-gray-300"
          }`}
          onClick={() => interactive && setNewRating(starNumber)}
          onMouseEnter={() => interactive && setHoveredStar(starNumber)}
          onMouseLeave={() => interactive && setHoveredStar(0)}
        />
      );
    });
  };

  const handleSubmitReview = () => {
    if (newReview.trim() && newRating > 0) {
      const review: Review = {
        id: Date.now().toString(),
        clientName: currentUser.name,
        rating: newRating,
        comment: newReview,
        date: new Date().toISOString().split('T')[0]
      };
      
      setReviews([review, ...reviews]);
      setNewReview("");
      setNewRating(0);
      setShowReviewForm(false);
    }
  };

  const handleSubmitProviderReview = () => {
    if (newProviderReview.trim() && newProviderRating > 0) {
      const review: ProviderReview = {
        id: Date.now().toString(),
        providerName: workerName,
        rating: newProviderRating,
        comment: newProviderReview,
        date: new Date().toISOString().split('T')[0],
        clientName: currentUser.name
      };
      
      setProviderReviews([review, ...providerReviews]);
      setNewProviderReview("");
      setNewProviderRating(0);
      setShowProviderReviewForm(false);
    }
  };

  const handleProviderResponse = (reviewId: string) => {
    const responseText = responseTexts[reviewId];
    if (responseText?.trim()) {
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { 
              ...review, 
              providerResponse: responseText,
              responseDate: new Date().toISOString().split('T')[0]
            }
          : review
      ));
      setResponseTexts({ ...responseTexts, [reviewId]: "" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs para cambiar entre reseñas */}
      <Card className="bg-serviceCard">
        <CardHeader>
          <CardTitle className="text-lg">Reseñas y Calificaciones</CardTitle>
          <div className="flex gap-2 mt-4">
            <Button
              variant={activeTab === 'client' ? 'default' : 'outline'}
              onClick={() => setActiveTab('client')}
              size="sm"
            >
              Reseñas de Clientes
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Reseñas de clientes */}
      {activeTab === 'client' && (
        <Card className="bg-serviceCard">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Reseñas de Clientes</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">{renderStars(averageRating)}</div>
                  <span className="font-semibold text-lg">{averageRating}</span>
                  <span className="text-muted-foreground">({totalReviews} reseñas)</span>
                </div>
              </div>
              
              {!currentUser.isProvider && !hasReviewed && (
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
            {showReviewForm && !hasReviewed && (
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
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSubmitReview}
                      disabled={!newReview.trim() || newRating === 0}
                    >
                      Publicar reseña
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowReviewForm(false)}
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
                        <h5 className="font-semibold">{review.clientName}</h5>
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(review.rating, false, "w-4 h-4")}</div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-card-foreground mb-3">{review.comment}</p>
                    
                    {/* Respuesta del prestador */}
                    {review.providerResponse && (
                      <div className="ml-4 p-3 bg-primary/10 rounded-lg border-l-4 border-primary">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">Respuesta del prestador</Badge>
                          <span className="text-sm text-muted-foreground">{review.responseDate}</span>
                        </div>
                        <p className="text-sm">{review.providerResponse}</p>
                      </div>
                    )}
                    
                    {/* Formulario de respuesta para prestador */}
                    {currentUser.isProvider && !review.providerResponse && (
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
                          />
                          <Button
                            size="sm"
                            onClick={() => handleProviderResponse(review.id)}
                            disabled={!responseTexts[review.id]?.trim()}
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
      )}
    </div>
  );
};

export default Reviews;