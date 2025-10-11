import { Star, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface ServiceCardProps {
  id: string;
  name: string;
  service: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  location: string;
  availability: string;
  image: string;
  description: string;
}

const ServiceCard = ({ 
  id,
  name, 
  service, 
  rating, 
  reviews, 
  hourlyRate, 
  location, 
  availability, 
  image, 
  description 
}: ServiceCardProps) => {
  return (
    <Card className="bg-serviceCard hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Worker Image */}
          <div className="flex-shrink-0">
            <img
              src={image}
              alt={`${name} - ${service}`}
              className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover"
            />
          </div>

          {/* Worker Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-card-foreground mb-1">
                  {name}
                </h3>
                <p className="text-primary font-medium mb-2">{service}</p>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="ml-1 font-medium">{rating}</span>
                  </div>
                  <span className="text-muted-foreground">({reviews} reseñas)</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{availability}</span>
                  </div>
                </div>

                <p className="text-sm text-card-foreground line-clamp-2">
                  {description}
                </p>
              </div>

              {/* Pricing and Action */}
              <div className="flex flex-col items-end mt-4 md:mt-0 md:ml-4">
                <div className="text-right mb-3">
                  <div className="text-2xl font-bold text-card-foreground">
                    ${hourlyRate}
                  </div>
                  <div className="text-sm text-muted-foreground">por hora</div>
                </div>

                <Link to={`/worker/${id}`}>
                  <Button 
                    className="bg-workerButton hover:bg-workerButton/90 text-workerButton-text"
                    size="sm"
                  >
                    Ver perfil
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;