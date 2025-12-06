'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { CompletedInterview } from '@/types';

// Importar hooks personalizados
import {
  useRecruiterData,
  useParticipants,
  useInterviews,
  useCompletedInterviews
} from './hooks';

// Importar servicios
import {
  createParticipantService,
  createInterviewService,
  createCompletedInterviewService,
  StorageService
} from './services';

// Importar componentes UI
import {
  LoadingSpinner,
  ParticipantsTab,
  InterviewResultsTab
} from './components';

// Importar utilidades
import {
  filterAndSortParticipants,
  getParticipantStats,
  validateParticipantData,
  formatDate
} from './utils';

interface RecruiterPanelProps {
  activeTab: string;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const RecruiterPanel = ({ activeTab, onShowToast }: RecruiterPanelProps) => {
  const { getAuthFetch, isAuthenticated } = useAuth();

  const [selectedInterview, setSelectedInterview] = React.useState<CompletedInterview | null>(null);

  // Hook principal para gestión de datos
  const recruiterData = useRecruiterData({ activeTab, onShowToast });
  
  // Crear instancias de servicios
  const participantService = React.useMemo(
    () => createParticipantService(getAuthFetch, isAuthenticated),
    [getAuthFetch, isAuthenticated]
  );
  
  const interviewService = React.useMemo(
    () => createInterviewService(getAuthFetch, isAuthenticated),
    [getAuthFetch, isAuthenticated]
  );
  
  const completedInterviewService = React.useMemo(
    () => createCompletedInterviewService(getAuthFetch, isAuthenticated),
    [getAuthFetch, isAuthenticated]
  );

  // Hook para gestión de participantes
  const participantsHook = useParticipants({
    participants: recruiterData.participants,
    setParticipants: recruiterData.setParticipants,
    availableInterviews: recruiterData.availableInterviews,
    assignedInterviews: recruiterData.assignedInterviews,
    setAssignedInterviews: recruiterData.setAssignedInterviews,
    searchTerm: recruiterData.searchTerm,
    statusFilter: recruiterData.statusFilter,
    sortBy: recruiterData.sortBy,
    onShowToast
  });

  // Hook para gestión de entrevistas
  const interviewsHook = useInterviews({
    interviews: recruiterData.interviews,
    setInterviews: recruiterData.setInterviews,
    onShowToast
  });

  // Hook para entrevistas completadas
  const completedInterviewsHook = useCompletedInterviews({
    completedInterviews: recruiterData.completedInterviews,
    loadInterviewByUserId: recruiterData.loadInterviewByUserId,
    onShowToast
  });

  // Renderizar tab de participantes
  if (activeTab === 'participants') {
    return (
      <ParticipantsTab
        // Data
        participants={recruiterData.participants}
        availableInterviews={recruiterData.availableInterviews}
        isLoadingTabData={recruiterData.isLoadingTabData}
        
        // Filters
        searchTerm={recruiterData.searchTerm}
        setSearchTerm={recruiterData.setSearchTerm}
        statusFilter={recruiterData.statusFilter}
        setStatusFilter={recruiterData.setStatusFilter}
        sortBy={recruiterData.sortBy}
        setSortBy={recruiterData.setSortBy}
        viewMode={recruiterData.viewMode}
        setViewMode={recruiterData.setViewMode}
        
        // Functions
        filteredAndSortedParticipants={participantsHook.filteredAndSortedParticipants}
        
        // Add Participant Modal
        showAddParticipantModal={participantsHook.showAddParticipantModal}
        setShowAddParticipantModal={participantsHook.setShowAddParticipantModal}
        newParticipant={participantsHook.newParticipant}
        setNewParticipant={participantsHook.setNewParticipant}
        handleAddParticipant={participantsHook.handleAddParticipant}
        
        // Assign Interview Modal
        showAssignInterviewModal={participantsHook.showAssignInterviewModal}
        setShowAssignInterviewModal={participantsHook.setShowAssignInterviewModal}
        selectedParticipant={participantsHook.selectedParticipant}
        setSelectedParticipant={participantsHook.setSelectedParticipant}
        selectedInterviewForAssignment={participantsHook.selectedInterviewForAssignment}
        setSelectedInterviewForAssignment={participantsHook.setSelectedInterviewForAssignment}
        handleAssignInterview={participantsHook.handleAssignInterview}
        isAssigningInterview={participantsHook.isAssigningInterview}
      />
    );
  }

  // Renderizar tab de entrevistas
  if (activeTab === 'interviews') {
    const totalInterviews = recruiterData.interviews.length;

    return (
      <div className="w-full h-full relative p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Entrevistas</h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Crea y gestiona las entrevistas que se asignarán a los participantes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Total: <span className="font-semibold text-slate-100">{totalInterviews}</span>
            </span>
            <button
              onClick={() => interviewsHook.setShowCreateInterviewModal(true)}
              className="inline-flex items-center px-4 py-2 border border-indigo-500/60 text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 hover:border-indigo-400 transition-colors"
            >
              <span className="mr-2">＋</span>
              Crear entrevista
            </button>
          </div>
        </div>

        <div className="bg-transparent">
          {totalInterviews === 0 ? (
            <div className="bg-slate-800/70 rounded-xl border border-slate-700/70 p-10 text-center text-slate-400 text-sm">
              <p className="mb-2 text-slate-100 font-medium">Aún no has creado entrevistas</p>
              <p className="mb-4 text-slate-400">
                Crea tu primera entrevista para poder asignarla a los participantes y empezar a recibir resultados.
              </p>
              <button
                onClick={() => interviewsHook.setShowCreateInterviewModal(true)}
                className="inline-flex items-center px-4 py-2 border border-indigo-500/60 text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 hover:border-indigo-400 transition-colors"
              >
                Crear primera entrevista
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recruiterData.interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-[0_18px_40px_rgba(15,23,42,0.8)] hover:shadow-[0_24px_60px_rgba(129,140,248,0.35)] hover:border-indigo-400/70 transition-all flex flex-col h-full overflow-hidden"
                >
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 opacity-70" />

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/15 border border-indigo-400/40 flex items-center justify-center text-[11px] text-indigo-300">
                          AI
                        </div>
                        <p className="text-sm font-semibold text-slate-50 truncate">
                          {interview.title}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        Creada el {formatDate(interview.createdAt)}
                      </p>
                    </div>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full border flex-shrink-0 backdrop-blur"
                      style={{
                        borderColor:
                          interview.status === 'Activa'
                            ? 'rgba(34,197,94,0.7)'
                            : interview.status === 'Borrador'
                            ? 'rgba(148,163,184,0.8)'
                            : 'rgba(248,113,113,0.8)',
                        backgroundColor:
                          interview.status === 'Activa'
                            ? 'rgba(22,163,74,0.25)'
                            : interview.status === 'Borrador'
                            ? 'rgba(148,163,184,0.18)'
                            : 'rgba(248,113,113,0.18)',
                        color:
                          interview.status === 'Activa'
                            ? '#bbf7d0'
                            : interview.status === 'Borrador'
                            ? '#e5e7eb'
                            : '#fecaca',
                      }}
                    >
                      {interview.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200/90 line-clamp-3 flex-1">
                    {interview.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{interview.questions?.length || 0} preguntas</span>
                    <span className="text-[10px] text-slate-500">ID {String(interview.id).slice(0, 6)}...</span>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => interviewsHook.handleDeleteInterview(String(interview.id))}
                      className="text-[11px] px-3 py-1 rounded-md border border-red-500/50 text-red-300 hover:bg-red-500/15 hover:border-red-400 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal para crear entrevista (se mantiene igual) */}
        {interviewsHook.showCreateInterviewModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-100">
                  {!interviewsHook.showQuestions ? 'Nueva Entrevista' : 'Preguntas Generadas con IA'}
                </h3>
                <button
                  onClick={() => {
                    interviewsHook.setShowCreateInterviewModal(false);
                    interviewsHook.setShowQuestions(false);
                    interviewsHook.setGeneratedQuestions([]);
                    interviewsHook.setGeneratedQuestionObjs([]);
                  }}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {!interviewsHook.showQuestions ? (
                /* Paso 1: Formulario inicial */
                <form onSubmit={interviewsHook.handleGenerateQuestions} className="space-y-6">
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">Título de la Entrevista</label>
                    <input
                      type="text"
                      value={interviewsHook.newInterview.title}
                      onChange={(e) => interviewsHook.setNewInterview(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-slate-700/50 border border-slate-600/30 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ej: Entrevista Frontend Developer"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">Descripción del Puesto</label>
                    <textarea
                      value={interviewsHook.newInterview.description}
                      onChange={(e) => interviewsHook.setNewInterview(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-slate-700/50 border border-slate-600/30 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none"
                      placeholder="Describe las habilidades, experiencia y responsabilidades del puesto para generar preguntas relevantes..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">Estado</label>
                    <select
                      value={interviewsHook.newInterview.status}
                      onChange={(e) => interviewsHook.setNewInterview(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full bg-slate-700/50 border border-slate-600/30 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="Borrador">Borrador</option>
                      <option value="Activa">Activa</option>
                    </select>
                  </div>
                  
                  <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        🤖
                      </div>
                      <h4 className="text-indigo-300 font-semibold">Generación con IA</h4>
                    </div>
                    <p className="text-slate-400 text-sm">
                      Nuestra IA analizará el título y descripción para generar 10 preguntas personalizadas con puntuación y tiempo estimado.
                    </p>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => interviewsHook.setShowCreateInterviewModal(false)}
                      className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={interviewsHook.isGeneratingQuestions}
                      className="flex-1 bg-gradient-to-r from-indigo-600/80 to-purple-600/80 hover:from-indigo-600/90 hover:to-purple-600/90 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 border border-indigo-500/30 hover:shadow-indigo-500/25 backdrop-blur-sm"
                    >
                      {interviewsHook.isGeneratingQuestions ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Generando con IA...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>🤖</span>
                          <span>Generar Preguntas con IA</span>
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Paso 2: Revisión de preguntas generadas */
                <div className="space-y-6">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        ✅
                      </div>
                      <h4 className="text-green-300 font-semibold">¡Preguntas Generadas!</h4>
                    </div>
                    <p className="text-slate-400 text-sm">
                      Revisa las preguntas generadas por IA. Puedes aprobarlas, editarlas o regenerar las que no te convenzan.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {interviewsHook.generatedQuestions.map((question, index) => (
                      <div key={index} className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="text-sm text-slate-400">
                              <span className="text-indigo-400 font-medium">
                                {interviewsHook.generatedQuestionObjs[index]?.points || 0} pts
                              </span>
                              <span className="mx-2">•</span>
                              <span className="text-purple-400 font-medium">
                                {Math.round((interviewsHook.generatedQuestionObjs[index]?.time || 0) / 60)} min
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => interviewsHook.handleToggleQuestionStatus(index)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                              interviewsHook.questionStatus[index] === 'approved'
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            }`}
                          >
                            {interviewsHook.questionStatus[index] === 'approved' ? '✅ Aprobada' : '🔄 Regenerar'}
                          </button>
                        </div>
                        <textarea
                          value={question}
                          onChange={(e) => interviewsHook.handleEditQuestion(index, e.target.value)}
                          className="w-full bg-slate-800/50 border border-slate-600/30 rounded-lg px-3 py-2 text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>

                  {interviewsHook.questionStatus.some(status => status === 'regenerate') && (
                    <button
                      onClick={interviewsHook.handleRegenerateQuestions}
                      disabled={interviewsHook.isGeneratingQuestions}
                      className="w-full bg-gradient-to-r from-yellow-600/80 to-orange-600/80 hover:from-yellow-600/90 hover:to-orange-600/90 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 border border-yellow-500/30"
                    >
                      {interviewsHook.isGeneratingQuestions ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Regenerando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>🔄</span>
                          <span>Regenerar Preguntas Marcadas</span>
                        </div>
                      )}
                    </button>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        interviewsHook.setShowQuestions(false);
                        interviewsHook.setGeneratedQuestions([]);
                        interviewsHook.setGeneratedQuestionObjs([]);
                      }}
                      className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                    >
                      ← Volver a Editar
                    </button>
                    <button
                      onClick={interviewsHook.handleCreateInterview}
                      disabled={interviewsHook.isCreatingInterview}
                      className="flex-1 bg-gradient-to-r from-green-600/80 to-emerald-600/80 hover:from-green-600/90 hover:to-emerald-600/90 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 border border-green-500/30 hover:shadow-green-500/25 backdrop-blur-sm"
                    >
                      {interviewsHook.isCreatingInterview ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Guardando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>💾</span>
                          <span>Crear Entrevista</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Renderizar tab de resultados
  if (activeTab === 'results') {
    const handleViewInterview = (interview: CompletedInterview) => {
      setSelectedInterview(interview);
    };

    return (
      <div className="w-full h-full p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Resultados de entrevistas</h2>
            <p className="text-slate-400 text-sm">
              Lista de entrevistas completadas por los candidatos.
            </p>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl overflow-hidden">
            <InterviewResultsTab
              completedInterviews={recruiterData.completedInterviews}
              isLoading={recruiterData.isLoadingTabData}
              onViewInterview={handleViewInterview}
            />
          </div>
        </div>

        {selectedInterview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 w-full max-w-3xl mx-4 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-100">
                    Detalles de la entrevista
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedInterview.userName} · {selectedInterview.interviewTitle}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInterview(null)}
                  className="text-slate-400 hover:text-slate-200 text-sm"
                >
                  Cerrar
                </button>
              </div>

              <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-800/70 rounded-lg p-3">
                    <p className="text-slate-400">Puntuación</p>
                    <p className="text-lg font-semibold text-slate-100">{Math.round(selectedInterview.score)}%</p>
                  </div>
                  <div className="bg-slate-800/70 rounded-lg p-3">
                    <p className="text-slate-400">Duración</p>
                    <p className="text-lg font-semibold text-slate-100">{Math.round(selectedInterview.duration / 60)} min</p>
                  </div>
                  <div className="bg-slate-800/70 rounded-lg p-3">
                    <p className="text-slate-400">Fecha</p>
                    <p className="text-xs font-medium text-slate-100">
                      {new Date(selectedInterview.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-100 mb-2">
                    Respuestas por pregunta
                  </h4>
                  <div className="space-y-3">
                    {selectedInterview.answers.map((answer, index) => (
                      <div key={index} className="bg-slate-800/70 border border-slate-700 rounded-lg p-3 text-xs">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-slate-200 font-medium">
                            {index + 1}. {answer.questionText}
                          </p>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-200">
                            {answer.points} pts
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs whitespace-pre-wrap break-words">
                          {answer.responseText || 'Sin respuesta registrada.'}
                        </p>
                        {answer.description && (
                          <p className="mt-2 text-[11px] text-slate-400">
                            {answer.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback para tabs no reconocidos
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-slate-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-100 mb-2">Tab no encontrado</h3>
        <p className="text-slate-400">El tab &ldquo;{activeTab}&rdquo; no está implementado</p>
      </div>
    </div>
  );
};
