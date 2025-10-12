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
import Payment from "./pages/Payment";
import ManageOccupations from "./pages/Admin/ManageOccupations";
import ValidateEmail from "./pages/ValidateEmail";
import NotFound from "./pages/NotFound";
import MisServicios from "./pages/MisServicios";
import EditarServicio from "./pages/EditarServicio";

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
            <Route path="/auth" element={<Auth />} />
            <Route path="/worker/register" element={<WorkerRegister />} />
            <Route path="/chat/:workerId" element={<Chat />} />
            <Route path="/payment/:workerId" element={<Payment />} />
            <Route path="/admin/occupations" element={<ManageOccupations />} />
            <Route path="/validate-email" element={<ValidateEmail />} />
            <Route path="/dashboard" element={<MisServicios />} />
            <Route path="/editar-servicio/:id" element={<EditarServicio />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;