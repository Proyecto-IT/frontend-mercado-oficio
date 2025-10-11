import { Wrench, Car, Droplets, Hammer, Zap, Paintbrush, Shield, Trees } from "lucide-react";

const categories = [
  { name: "Carpintería", icon: Hammer, color: "bg-blue-100 text-blue-600" },
  { name: "Mecánica", icon: Car, color: "bg-red-100 text-red-600" },
  { name: "Plomería", icon: Droplets, color: "bg-cyan-100 text-cyan-600" },
  { name: "Electricista", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
  { name: "Pintura", icon: Paintbrush, color: "bg-purple-100 text-purple-600" },
  { name: "Seguridad", icon: Shield, color: "bg-green-100 text-green-600" },
  { name: "Jardinería", icon: Trees, color: "bg-emerald-100 text-emerald-600" },
  { name: "Reparaciones", icon: Wrench, color: "bg-orange-100 text-orange-600" },
];

const ServiceCategories = () => {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-card-foreground mb-6">
        Categorías de Servicios
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <div
              key={category.name}
              className="bg-serviceCard rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center mx-auto mb-2`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-card-foreground">{category.name}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ServiceCategories;