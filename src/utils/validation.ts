// src/utils/validation.ts

export const validarHorario = (horario: string): boolean => {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!regex.test(horario)) {
    return false;
  }
  
  const [inicio, fin] = horario.split('-');
  const [horaInicio, minInicio] = inicio.split(':').map(Number);
  const [horaFin, minFin] = fin.split(':').map(Number);
  
  const minutosInicio = horaInicio * 60 + minInicio;
  const minutosFin = horaFin * 60 + minFin;
  
  return minutosInicio < minutosFin;
};

export const validarDisponibilidad = (disponibilidad: { [dia: string]: string }): string | null => {
  const diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  
  for (const [dia, horario] of Object.entries(disponibilidad)) {
    if (!diasValidos.includes(dia.toLowerCase())) {
      return `El día "${dia}" no es válido`;
    }
    
    if (!validarHorario(horario)) {
      return `El horario "${horario}" del día ${dia} no es válido. Use formato HH:mm-HH:mm`;
    }
  }
  
  return null;
};

export const formatearTarifa = (tarifa: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(tarifa);
};

export const diasSemana = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' }
];