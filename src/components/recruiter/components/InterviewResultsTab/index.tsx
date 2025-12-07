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

  // Calcular ranking por tipo de entrevista (título)
  const interviewsByTitle = completedInterviews.reduce<Record<string, CompletedInterview[]>>((acc, interview) => {
    const key = interview.interviewTitle || 'Sin título';
    if (!acc[key]) acc[key] = [];
    acc[key].push(interview);
    return acc;
  }, {});

  const interviewTitles = Object.keys(interviewsByTitle);

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

      {/* Bloque de Ranking por tipo de entrevista */}
      <div className="px-4 pt-4 pb-2 sm:px-6 border-b border-slate-700 bg-slate-900/40 space-y-4">
        {interviewTitles.length === 0 ? (
          <p className="text-[11px] text-slate-500">Aún no hay suficientes datos para el ranking.</p>
        ) : (
          interviewTitles.map((title) => {
            const list = [...interviewsByTitle[title]].sort((a, b) => b.score - a.score);
            const topCountByTitle = Math.min(3, list.length);
            const bottomCountByTitle = Math.min(3, list.length - topCountByTitle);
            const topByTitle = list.slice(0, topCountByTitle);
            const bottomByTitle = bottomCountByTitle > 0 ? list.slice(-bottomCountByTitle) : [];

            return (
              <div key={title} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-indigo-400 to-purple-500" />
                    {title}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {list.length} entrevista{list.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex flex-col lg:flex-row gap-3">
                  {/* Top por tipo */}
                  <div className="flex-1">
                    <h5 className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <span className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-400 to-indigo-500" />
                      Mejores puntuaciones
                    </h5>
                    {topByTitle.length === 0 ? (
                      <p className="text-[11px] text-slate-500">Sin datos para este tipo.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {topByTitle.map((interview, index) => (
                          <div
                            key={interview.id}
                            className="relative rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-slate-900/40 to-slate-900/80 p-3 shadow-md shadow-emerald-500/10"
                          >
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500/90 flex items-center justify-center text-[10px] font-bold text-slate-950 shadow-lg">
                              #{index + 1}
                            </div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="h-7 w-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 text-xs font-semibold">
                                {interview.userName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-slate-100 truncate">
                                  {interview.userName}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {new Date(interview.date).toLocaleDateString('es-ES')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <div>
                                <p className="text-[10px] text-slate-400">Puntuación</p>
                                <p className="text-xs font-semibold text-emerald-300">
                                  {Math.round(interview.score)}%
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-slate-400">Duración</p>
                                <p className="text-[11px] text-slate-200">
                                  {formatDuration(interview.duration)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Peores por tipo */}
                  {bottomByTitle.length > 0 && (
                    <div className="flex-1">
                      <h5 className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <span className="w-1 h-4 rounded-full bg-gradient-to-b from-rose-400 to-amber-500" />
                        Puntuaciones más bajas
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {bottomByTitle.map((interview) => (
                          <div
                            key={interview.id}
                            className="rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-slate-900/40 to-slate-900/80 p-3 shadow-md shadow-rose-500/10"
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="h-7 w-7 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-300 text-xs font-semibold">
                                {interview.userName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-slate-100 truncate">
                                  {interview.userName}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {new Date(interview.date).toLocaleDateString('es-ES')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <div>
                                <p className="text-[10px] text-slate-400">Puntuación</p>
                                <p className="text-xs font-semibold text-rose-300">
                                  {Math.round(interview.score)}%
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-slate-400">Duración</p>
                                <p className="text-[11px] text-slate-200">
                                  {formatDuration(interview.duration)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
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
