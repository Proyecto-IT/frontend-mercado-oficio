import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store"; // Ajusta la ruta según tu estructura
import Index from "./pages/Index";
import WorkerProfile from "./pages/WorkerProfile";
import Auth from "./pages/Auth";
import WorkerRegister from "./pages/WorkerRegister";
import Chat from "./pages/Chat";
import ManageOccupations from "./pages/Admin/ManageOccupations";
import ValidateEmail from "./pages/ValidateEmail";
import NotFound from "./pages/NotFound";
import MisServicios from "./pages/MisServicios";
import EditarServicio from "./pages/EditarServicio";
import SolicitarPresupuesto from "@/pages/SolicitarPresupuesto";
import ResponderPresupuesto from "@/pages/ResponderPresupuesto";
import MisSolicitudes from "@/pages/MisSolicitudes";
import VerHitos from "@/pages/VerHitosPresupuesto";
import PresupuestosPorServicio from "@/pages/PresupuestosPorServicio";
import VerHitosWrapper from "./pages/VerHitosWrapper";
import VerHitosPresupuesto from "@/pages/VerHitosPresupuesto";
import VerHitosCliente from "@/pages/VerHitosCliente"
const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/servicio/:id" element={<WorkerProfile />} />
            <Route path="/presupuesto/solicitar/:servicioId" element={<SolicitarPresupuesto />} />
            <Route path="/presupuesto/:presupuestoId/responder" element={<ResponderPresupuesto />} />
            <Route path="/mis-solicitudes" element={<MisSolicitudes />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/worker/register" element={<WorkerRegister />} />
            <Route path="/mis-hitos-cliente" element={<VerHitosCliente />} />
            <Route path="/chat/:workerId" element={<Chat />} />
            <Route path="/admin/occupations" element={<ManageOccupations />} />
            <Route path="/validate-email" element={<ValidateEmail />} />
            <Route path="/dashboard" element={<MisServicios />} />
            <Route path="/editar-servicio/:id" element={<EditarServicio />} />
            <Route path="/ver-hitos/:presupuestoId" element={<VerHitosWrapper />} />
            <Route path="/presupuestos-servicio/:servicioId" element={<PresupuestosPorServicio />} />            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;