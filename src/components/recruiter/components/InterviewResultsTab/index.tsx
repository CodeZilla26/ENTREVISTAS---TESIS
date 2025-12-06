import React from 'react';
import { CompletedInterview } from '@/types';

interface InterviewResultsTabProps {
  completedInterviews: CompletedInterview[];
  isLoading: boolean;
  onViewInterview: (interview: CompletedInterview) => void;
}

const InterviewResultsTab: React.FC<InterviewResultsTabProps> = ({
  completedInterviews,
  isLoading,
  onViewInterview,
}) => {
  // Función para obtener el color según la puntuación
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Función para obtener el texto del nivel de puntuación
  const getScoreLevel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    return 'Necesita mejorar';
  };
  
  // Formatear la duración de segundos a minutos:segundos
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-800/70 rounded-xl border border-slate-700/70">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (completedInterviews.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800/70 rounded-xl border border-slate-700/70">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-slate-100">No hay resultados disponibles</h3>
        <p className="mt-1 text-sm text-slate-400">
          Aún no se han completado entrevistas o no hay datos para mostrar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl overflow-hidden">
      <div className="px-4 py-4 sm:px-6 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="text-lg leading-6 font-semibold text-slate-100">
            Resultados de entrevistas
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Entrevistas completadas por los candidatos.
          </p>
        </div>
        <span className="text-xs text-slate-400">
          Total: <span className="font-semibold text-slate-100">{completedInterviews.length}</span>
        </span>
      </div>
      
      <div className="overflow-x-hidden">
        <table className="w-full table-fixed divide-y divide-slate-700 text-sm">
          <thead className="bg-slate-900/60">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-1/4"
              >
                Candidato
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Puesto
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Fecha
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Puntuación
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nivel
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-800/90 divide-y divide-slate-700">
            {completedInterviews.map((interview) => (
              <tr key={interview.id} className="hover:bg-slate-700/60 transition-colors">
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center min-w-0">
                    <div className="flex-shrink-0 h-9 w-9">
                      <div className="h-9 w-9 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-medium text-sm">
                        {interview.userName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-3 min-w-0">
                      <div className="text-sm font-medium text-slate-100 truncate">
                        {interview.userName}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        ID: {interview.userId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="text-sm text-slate-100 truncate max-w-[180px]">
                    {interview.interviewTitle}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Duración: {formatDuration(interview.duration)} min
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-sm text-slate-300">
                  {new Date(interview.date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3 align-top">
                  <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getScoreColor(interview.score)}`}>
                    {Math.round(interview.score)}%
                  </span>
                </td>
                <td className="px-4 py-3 align-top text-sm text-slate-300">
                  {getScoreLevel(interview.score)}
                </td>
                <td className="px-4 py-3 align-top text-right text-sm font-medium">
                  <button
                    onClick={() => onViewInterview(interview)}
                    className="text-purple-300 hover:text-purple-100"
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Paginación simple (texto informativo, sin botones grandes) */}
      <div className="px-4 py-3 border-t border-slate-700/70 flex items-center justify-end text-xs text-slate-400">
        <p>
          Mostrando <span className="font-semibold text-slate-200">{completedInterviews.length}</span>{' '}
          resultado{completedInterviews.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default InterviewResultsTab;
