import { useParams, useNavigate } from "react-router-dom";
import VerHitosPresupuesto from "./VerHitosPresupuesto";

const VerHitosWrapper = () => {
  const { presupuestoId } = useParams<{ presupuestoId: string }>();
  const navigate = useNavigate();

  if (!presupuestoId) {
    navigate('/mis-servicios');
    return null;
  }

  return (
    <VerHitosPresupuesto 
      presupuestoId={Number(presupuestoId)} 
      onVolver={() => navigate(-1)}
    />
  );
};

export default VerHitosWrapper;