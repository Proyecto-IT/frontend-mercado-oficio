import { useState, useMemo } from "react";
import { presupuestoServicio } from "@/services/presupuestoServicio";
import { hitoServicio } from "@/services/hitoServicio";
import { EstadoPresupuesto } from "@/types/presupuesto.types";

// Utilidades de fecha
const formatDate = (date, format = "dd/MM/yyyy") => {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const dayName = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'][d.getDay()];
  
  if (format.includes('EEEE')) return `${day}/${month}/${year} (${dayName})`;
  return `${day}/${month}/${year}`;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getDay = (date) => date.getDay();

const SolicitudPresupuestoCard = ({ solicitud, onActualizar }) => {
  const [mostrarDialogoEliminar, setMostrarDialogoEliminar] = useState(false);
  const [mostrarDialogoPago, setMostrarDialogoPago] = useState(false);
  const [mostrarSelectorHorarios, setMostrarSelectorHorarios] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);
  const [horariosSeleccionados, setHorariosSeleccionados] = useState(
    solicitud.horariosSeleccionados || []
  );

  // No mostrar presupuestos pendientes sin respuesta del prestador
  if (solicitud.estado === EstadoPresupuesto.PENDIENTE && !solicitud.respondido) {
    return null;
  }

  // No mostrar presupuestos sin total
  if (!solicitud.presupuesto || solicitud.presupuesto === 0) {
    return null;
  }

  const parseDisponibilidad = () => {
    if (!solicitud.disponibilidad) return [];
    try {
      const parsed = JSON.parse(solicitud.disponibilidad);
      
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        const resultado = [];
        
        for (const [dia, horarios] of Object.entries(parsed)) {
          if (typeof horarios === 'string') {
            const rangos = horarios.split(',');
            rangos.forEach(rango => {
              const [horaInicio, horaFin] = rango.trim().split('-');
              resultado.push({
                dia: dia.toUpperCase(),
                horaInicio: horaInicio.trim(),
                horaFin: horaFin.trim(),
              });
            });
          }
        }
        
        return resultado;
      }
      
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error al parsear disponibilidad:", error);
      return [];
    }
  };

  const disponibilidadParsed = useMemo(() => parseDisponibilidad(), [solicitud.disponibilidad]);

  const horasRestantes = useMemo(() => {
    const totalSeleccionado = horariosSeleccionados.reduce((sum, h) => sum + h.duracionHoras, 0);
    return solicitud.horasEstimadas - totalSeleccionado;
  }, [horariosSeleccionados, solicitud.horasEstimadas]);

  const puedeConfirmar = horasRestantes === 0;

  const handleAgregarHorario = (fecha, horaInicio, horaFin) => {
    const inicio = new Date(`2000-01-01T${horaInicio}`);
    const fin = new Date(`2000-01-01T${horaFin}`);
    const duracionMs = fin.getTime() - inicio.getTime();
    const duracionHoras = duracionMs / (1000 * 60 * 60);

    if (duracionHoras > horasRestantes) {
      alert(`Solo tienes ${horasRestantes}h disponibles`);
      return;
    }

    const nuevoHorario = {
      fecha,
      horaInicio,
      horaFin,
      duracionHoras,
    };

    setHorariosSeleccionados([...horariosSeleccionados, nuevoHorario]);
  };

  const handleRemoverHorario = (index) => {
    setHorariosSeleccionados(horariosSeleccionados.filter((_, i) => i !== index));
  };

  const handleAprobar = async () => {
    if (!puedeConfirmar) {
      alert(`Faltan ${horasRestantes}h para completar el servicio`);
      return;
    }

    try {
      setProcesando(true);
      setError(null);

      // Actualizar el presupuesto con los horarios seleccionados
      await presupuestoServicio.actualizar(solicitud.id, {
        idPrestador: solicitud.idPrestador,
        horasEstimadas: solicitud.horasEstimadas,
        costoMateriales: solicitud.costoMateriales,
        descripcionSolucion: solicitud.descripcionSolucion,
        horariosSeleccionados: horariosSeleccionados
      });

      // Mostrar el diálogo de pago
      setMostrarDialogoPago(true);
    } catch (err) {
      console.error("Error al aprobar:", err);
      setError(err.response?.data?.error || "Error al aprobar la solicitud");
    } finally {
      setProcesando(false);
    }
  };

  const handleRechazar = async () => {
    try {
      setProcesando(true);
      setError(null);
      
      await presupuestoServicio.actualizarEstado(solicitud.id, EstadoPresupuesto.RECHAZADO);
      onActualizar();
    } catch (err) {
      console.error("Error al rechazar:", err);
      setError(err.response?.data?.error || "Error al rechazar el presupuesto");
    } finally {
      setProcesando(false);
    }
  };

  const handlePagarServicio = async () => {
    try {
      setProcesando(true);
      setError(null);

      // 1. Actualizar estado del presupuesto a APROBADO
      await presupuestoServicio.actualizarEstado(solicitud.id, EstadoPresupuesto.APROBADO);

      // 2. Crear hitos automáticos
      if (horariosSeleccionados && horariosSeleccionados.length > 0) {
        const hitos = await hitoServicio.crearHitosAutomaticos(
          solicitud.id,
          horariosSeleccionados
        );
        
        console.log(`✅ ${hitos.length} hitos creados automáticamente`);
      }

      // 3. Cerrar diálogo y actualizar vista
      setMostrarDialogoPago(false);
      onActualizar();
      
      alert(`✓ Pago procesado correctamente.\n${horariosSeleccionados.length} hitos creados automáticamente.`);
    } catch (err) {
      console.error("Error al procesar pago:", err);
      setError(err.response?.data?.error || "Error al procesar el pago del servicio");
    } finally {
      setProcesando(false);
    }
  };

  const handleEliminar = async () => {
    try {
      setProcesando(true);
      await presupuestoServicio.eliminar(solicitud.id);
      setMostrarDialogoEliminar(false);
      onActualizar();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Error al eliminar la solicitud");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-4 flex justify-between items-start">
          <h2 className="text-lg font-semibold text-gray-800">Solicitud #{solicitud.id}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            solicitud.estado === EstadoPresupuesto.PENDIENTE ? 'bg-yellow-100 text-yellow-700' :
            solicitud.estado === EstadoPresupuesto.APROBADO ? 'bg-green-100 text-green-700' :
            solicitud.estado === EstadoPresupuesto.RECHAZADO ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {solicitud.estado}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="text-sm">
            <p className="text-gray-600"><strong>Prestador:</strong> {solicitud.nombrePrestador} {solicitud.apellidoPrestador}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-1">Descripción del problema:</p>
            <p className="text-sm text-gray-600">{solicitud.descripcionProblema}</p>
          </div>

          {solicitud.descripcionSolucion && (
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">Solución propuesta:</p>
              <p className="text-sm text-gray-600">{solicitud.descripcionSolucion}</p>
            </div>
          )}

          {disponibilidadParsed.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-blue-900 mb-2">🕐 Disponibilidad del Prestador</p>
              <div className="space-y-1">
                {disponibilidadParsed.map((disp, idx) => (
                  <p key={idx} className="text-xs text-blue-800">
                    {disp.dia}: {disp.horaInicio} - {disp.horaFin}
                  </p>
                ))}
              </div>
            </div>
          )}

          {solicitud.estado === EstadoPresupuesto.PENDIENTE && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-800">📅 Seleccionar Horarios</p>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {horasRestantes}h restantes
                </span>
              </div>

              {horariosSeleccionados.length > 0 && (
                <div className="mb-3 space-y-2 bg-gray-50 p-2 rounded">
                  {horariosSeleccionados.map((horario, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                      <span className="text-xs font-medium">
                        {formatDate(horario.fecha)} - {horario.horaInicio} a {horario.horaFin} ({horario.duracionHoras}h)
                      </span>
                      <button
                        onClick={() => handleRemoverHorario(idx)}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setMostrarSelectorHorarios(!mostrarSelectorHorarios)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                {mostrarSelectorHorarios ? "Ocultar" : "Mostrar"} selector de horarios
              </button>

              {mostrarSelectorHorarios && (
                <SelectorHorarios
                  disponibilidad={disponibilidadParsed}
                  horasRestantes={horasRestantes}
                  onAgregarHorario={handleAgregarHorario}
                />
              )}
            </div>
          )}

          {/* Detalles de precio */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div>
              <p className="text-xs text-gray-600">Tarifa/hora</p>
              <p className="text-sm font-semibold text-gray-800">${solicitud.tarifaHora}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Horas estimadas</p>
              <p className="text-sm font-semibold text-gray-800">{solicitud.horasEstimadas}h</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Materiales</p>
              <p className="text-sm font-semibold text-gray-800">${solicitud.costoMateriales}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-base font-bold text-blue-600">${solicitud.presupuesto}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 rounded p-3">
              <p className="text-sm text-red-700">⚠️ {error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t p-4 space-y-2">
          {solicitud.estado === EstadoPresupuesto.PENDIENTE && (
            <div className="flex gap-2">
              <button
                onClick={handleAprobar}
                disabled={procesando || !puedeConfirmar}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded font-medium text-sm"
                title={!puedeConfirmar ? `Faltan ${horasRestantes}h` : ""}
              >
                ✓ {procesando ? "Procesando..." : "Aprobar"}
              </button>
              <button
                onClick={handleRechazar}
                disabled={procesando}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 rounded font-medium text-sm"
              >
                ✕ Rechazar
              </button>
            </div>
          )}

          {solicitud.estado === EstadoPresupuesto.APROBADO && (
            <div className="w-full p-3 bg-green-50 border border-green-300 rounded text-center">
              <p className="text-sm font-semibold text-green-700">✓ Servicio pagado y en progreso</p>
              <p className="text-xs text-green-600 mt-1">Hitos creados automáticamente</p>
            </div>
          )}

          {solicitud.estado === EstadoPresupuesto.RECHAZADO && (
            <div className="w-full p-3 bg-red-50 border border-red-300 rounded text-center">
              <p className="text-sm font-semibold text-red-700">✕ Presupuesto rechazado</p>
            </div>
          )}

          <button
            onClick={() => setMostrarDialogoEliminar(true)}
            disabled={procesando}
            className="w-full border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 py-2 rounded font-medium text-sm"
          >
            🗑️ Eliminar Solicitud
          </button>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {mostrarDialogoEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-semibold mb-2">¿Estás seguro?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Esta acción no se puede deshacer. Se eliminará permanentemente esta solicitud de presupuesto.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setMostrarDialogoEliminar(false)}
                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={procesando}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 rounded font-medium text-sm"
              >
                {procesando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de pago */}
      {mostrarDialogoPago && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">Confirmar pago del servicio</h3>
            <p className="text-sm text-gray-600 mb-4">
              Estás a punto de aprobar y pagar este servicio. Se crearán los hitos automáticamente según los horarios programados.
            </p>

            <div className="space-y-3 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Prestador:</span>
                  <span className="text-sm">{solicitud.nombrePrestador} {solicitud.apellidoPrestador}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Horas estimadas:</span>
                  <span className="text-sm">{solicitud.horasEstimadas}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Costo materiales:</span>
                  <span className="text-sm">${solicitud.costoMateriales?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-base font-bold">Total a pagar:</span>
                  <span className="text-lg font-bold text-blue-600">${solicitud.presupuesto.toLocaleString()}</span>
                </div>
              </div>

              {horariosSeleccionados && horariosSeleccionados.length > 0 && (
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-sm font-medium mb-2">
                    Se crearán {horariosSeleccionados.length} hitos
                  </p>
                  <p className="text-xs text-gray-600">
                    Cada hito corresponderá a una sesión de servicio programada
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-300 rounded p-3">
                  <p className="text-sm text-red-700">⚠️ {error}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMostrarDialogoPago(false);
                  setError(null);
                }}
                disabled={procesando}
                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 py-2 rounded font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handlePagarServicio}
                disabled={procesando}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded font-medium text-sm"
              >
                {procesando ? "Procesando..." : "💳 Confirmar Pago"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SelectorHorarios = ({ disponibilidad, horasRestantes, onAgregarHorario }) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [diaSeleccionado, setDiaSeleccionado] = useState("");

  const diasSemana = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
  const diasUnicos = [...new Set(disponibilidad.map(d => d.dia))];

  const horariosDisponiblesHoy = disponibilidad.filter(d => d.dia === diaSeleccionado);

  const generarFechasValidas = () => {
    if (!diaSeleccionado) return [];
    
    const fechas = [];
    const hoy = new Date();
    
    for (let i = 0; i < 60; i++) {
      const fechaBuscada = addDays(hoy, i);
      const dayOfWeek = getDay(fechaBuscada);
      const diaDelaFecha = diasSemana[dayOfWeek];
      
      if (diaDelaFecha === diaSeleccionado) {
        const year = String(fechaBuscada.getFullYear());
        const month = String(fechaBuscada.getMonth() + 1).padStart(2, '0');
        const day = String(fechaBuscada.getDate()).padStart(2, '0');
        fechas.push(`${year}-${month}-${day}`);
      }
    }
    
    return fechas;
  };

  const fechasValidas = generarFechasValidas();
  const fechaEsValida = () => fechaSeleccionada && fechasValidas.includes(fechaSeleccionada);

  const calcularDuracion = () => {
    if (!horaInicio || !horaFin) return 0;
    const inicio = new Date(`2000-01-01T${horaInicio}`);
    const fin = new Date(`2000-01-01T${horaFin}`);
    return (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
  };

  const duracionCalculada = calcularDuracion();
  const horaFinValida = !horaFin || horaFin > horaInicio;
  const puedeAgregar = fechaSeleccionada && horaInicio && horaFin && horaFinValida && horariosDisponiblesHoy.length > 0 && fechaEsValida();

  const handleAgregarClick = () => {
    if (!puedeAgregar || duracionCalculada > horasRestantes) return;

    onAgregarHorario(fechaSeleccionada, horaInicio, horaFin);
    setFechaSeleccionada("");
    setHoraInicio("");
    setHoraFin("");
    setDiaSeleccionado("");
  };

  return (
    <div className="mt-3 p-3 bg-gray-100 rounded space-y-3">
      <div>
        <label className="text-xs font-semibold block mb-1">Selecciona un día de la semana</label>
        <select
          value={diaSeleccionado}
          onChange={(e) => {
            setDiaSeleccionado(e.target.value);
            setHoraInicio("");
            setHoraFin("");
            setFechaSeleccionada("");
          }}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="">-- Selecciona día --</option>
          {diasSemana.map(dia => {
            const tieneDisponibilidad = diasUnicos.includes(dia);
            return (
              <option key={dia} value={dia} disabled={!tieneDisponibilidad}>
                {dia} {tieneDisponibilidad ? "" : "(No disponible)"}
              </option>
            );
          })}
        </select>
      </div>

      {horariosDisponiblesHoy.length > 0 && (
        <>
          <div className="bg-white p-2 rounded border border-blue-300">
            <p className="text-xs text-blue-900 font-semibold mb-1">Disponibilidad:</p>
            {horariosDisponiblesHoy.map((hor, idx) => (
              <p key={idx} className="text-xs text-blue-800">
                {hor.dia}: {hor.horaInicio} - {hor.horaFin}
              </p>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1">Selecciona una fecha ({diaSeleccionado})</label>
            {fechasValidas.length > 0 ? (
              <select
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="">-- Selecciona una fecha --</option>
                {fechasValidas.map((fecha) => (
                  <option key={fecha} value={fecha}>
                    {formatDate(fecha)}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-red-600">No hay fechas disponibles</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold block mb-1">Hora de inicio</label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                min={horariosDisponiblesHoy[0]?.horaInicio}
                max={horariosDisponiblesHoy[0]?.horaFin}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Hora de fin</label>
              <input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                min={horaInicio || horariosDisponiblesHoy[0]?.horaInicio}
                max={horariosDisponiblesHoy[0]?.horaFin}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              />
            </div>
          </div>

          {horaInicio && horaFin && horaFinValida && (
            <div className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
              <p className="text-blue-900">
                Duración: {duracionCalculada.toFixed(1)}h
                {duracionCalculada > horasRestantes && (
                  <span className="text-red-600 block mt-1">
                    ⚠️ Excede las {horasRestantes}h disponibles
                  </span>
                )}
              </p>
            </div>
          )}
        </>
      )}

      <button
        onClick={handleAgregarClick}
        disabled={!puedeAgregar || duracionCalculada > horasRestantes}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded font-medium text-sm"
      >
        Agregar Horario
      </button>
    </div>
  );
};

export default SolicitudPresupuestoCard;