'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User, UserApiResponse, ApiErrorResponse } from '@/types';
import { clearSession, getSavedUser, isAuthenticated as authIsAuthenticated, setSession } from '@/lib/auth';
import { buildApiUrl, handleApiError, fetchWithTimeout, isNetworkError, sleep } from '@/lib/api';

interface LoginArgs {
  email: string;
  role?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoadingUserData: boolean;
  login: (args: LoginArgs) => void;
  logout: () => void;
  isRecruiter: boolean;
  isApplicant: boolean;
  hasRole: (role: string) => boolean;
  getAuthHeader: () => Record<string, string>;
  getAuthFetch: (pathOrUrl: string, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingUserData, setIsLoadingUserData] = useState<boolean>(false);

  // Función para obtener datos del usuario desde la API
  const fetchUserData = async (email: string): Promise<User | null> => {
    try {
      setIsLoadingUserData(true);
      console.log('[AuthContext] Obteniendo datos del usuario para:', email);
      
      // Usar localhost en lugar de la URL remota para findByEmail
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/findByEmail?email=${encodeURIComponent(email)}`;
      console.log('[AuthContext] URL:', url);

      const response = await fetchWithTimeout(url, {
        method: 'GET'
      }, 10000);

      if (response.ok) {
        const userData: UserApiResponse = await response.json();
        console.log('[AuthContext] Datos del usuario obtenidos:', userData);
        
        const saved = getSavedUser();
        const userType = saved?.role && saved.role.toLowerCase().includes('reclutador') ? 'reclutador' : 'postulante';
        
        return {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          lastName: userData.lastName,
          password: '',
          type: userType
        };
      } else {
        console.error('[AuthContext] ❌ Respuesta no exitosa:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          email: email
        });
        
        const errorData: ApiErrorResponse = await response.json().catch(() => ({
          code: 'UNKNOWN_ERROR',
          message: 'Error desconocido al obtener datos del usuario',
          details: [],
          timestamp: new Date().toISOString()
        }));
        
        console.error('[AuthContext] Error obteniendo datos del usuario:', errorData);
        
        // Si hay error, usar datos básicos del email
        console.warn('[AuthContext] ⚠️ Usando fallback - nombre será el email:', email);
        const saved = getSavedUser();
        const userType = saved?.role && saved.role.toLowerCase().includes('reclutador') ? 'reclutador' : 'postulante';
        
        return {
          email: email,
          name: email, // fallback al email
          password: '',
          type: userType
        };
      }
    } catch (error) {
      console.error('[AuthContext] Error de red obteniendo datos del usuario:', error);
      
      // Fallback en caso de error de red
      console.warn('[AuthContext] ⚠️ Error de red - usando fallback, nombre será el email:', email);
      const saved = getSavedUser();
      const userType = saved?.role && saved.role.toLowerCase().includes('reclutador') ? 'reclutador' : 'postulante';
      
      return {
        email: email,
        name: email, // fallback al email
        password: '',
        type: userType
      };
    } finally {
      setIsLoadingUserData(false);
    }
  };

  // Restore session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[AuthContext] 🔄 Inicializando autenticación...');
      const saved = getSavedUser();
      
      if (saved) {
        console.log('[AuthContext] ✅ Usuario guardado encontrado');
        // Obtener datos completos del usuario desde la API
        const userData = await fetchUserData(saved.email);
        if (userData) {
          setUser(userData);
          console.log('[AuthContext] ✅ Usuario cargado desde API:', userData.email);
        } else {
          // Fallback si no se pueden obtener los datos
          const u: User = {
            email: saved.email,
            name: saved.email,
            password: '',
            type: saved.role && saved.role.toLowerCase().includes('reclutador') ? 'reclutador' : 'postulante',
          };
          setUser(u);
          console.log('[AuthContext] ⚠️ Usuario cargado con fallback:', u.email);
        }
      } else {
        console.log('[AuthContext] ❌ No hay usuario guardado');
        setUser(null);
      }
      
      setIsInitializing(false);
      console.log('[AuthContext] ✅ Inicialización completada');
    };
    
    initializeAuth();
  }, []);

  // Keep token in sync when storage changes (other tabs)
  useEffect(() => {
    const handler = () => {
      const saved = getSavedUser();
      if (saved) {
        // Obtener datos completos del usuario desde la API
        fetchUserData(saved.email).then((userData) => {
          if (userData) {
            setUser(userData);
          } else {
            // Fallback si no se pueden obtener los datos
            const u: User = {
              email: saved.email,
              name: saved.email,
              password: '',
              type: saved.role && saved.role.toLowerCase().includes('reclutador') ? 'reclutador' : 'postulante',
            };
            setUser(u);
          }
        });
      } else {
        setUser(null);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const login = (args: LoginArgs) => {
    setSession({ email: args.email, role: args.role });
    
    // Obtener datos completos del usuario desde la API
    fetchUserData(args.email).then((userData) => {
      if (userData) {
        setUser(userData);
      } else {
        // Fallback si no se pueden obtener los datos
        const u: User = {
          email: args.email,
          name: args.email,
          password: '',
          type: args.role && args.role.toLowerCase().includes('reclutador') ? 'reclutador' : 'postulante',
        };
        setUser(u);
      }
    });
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: authIsAuthenticated(),
    isInitializing,
    isLoadingUserData,
    login,
    logout,
    isRecruiter: !!user && user.type === 'reclutador',
    isApplicant: !!user && user.type === 'postulante',
    hasRole: (role: string) => {
      const saved = getSavedUser();
      return !!(saved?.role && saved.role.toLowerCase() === role.toLowerCase());
    },
    getAuthHeader: () => ({} as Record<string, string>),
    getAuthFetch: async (pathOrUrl: string, init?: RequestInit) => {
      const url = pathOrUrl.startsWith('http') ? pathOrUrl : buildApiUrl(pathOrUrl);
      const method = (init?.method || 'GET').toUpperCase();
      const isGet = method === 'GET';
      
      // Timeout especial para envío de entrevistas (archivos multimedia)
      const isInterviewFinish = pathOrUrl.includes('/finishInterview') || pathOrUrl.includes('/finish');
      const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
      
      let defaultTimeout = isGet ? 10000 : 12000;
      if (isInterviewFinish && isFormData) {
        defaultTimeout = 120000; // 2 minutos para archivos multimedia
        console.log('[AuthContext] 📤 Usando timeout extendido (2 min) para envío de entrevista');
      }
      
      const maxRetries = isGet ? 2 : 1;

      let attempt = 0;
      let lastError: any = null;
      while (attempt <= maxRetries) {
        try {
          const res = await fetchWithTimeout(url, {
            ...init,
            headers: {
              // Do not set Content-Type for FormData; browser will set proper boundaries
              ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
              ...(init?.headers || {}),
            },
          }, defaultTimeout);
          if (!res.ok) {
            // Reintentos solo para 5xx en GET; para POST solo si network error/timeout
            if (res.status >= 500 && res.status < 600 && isGet && attempt < maxRetries) {
              attempt++;
              await sleep(400 * attempt); // backoff simple
              continue;
            }
            throw new Error(await handleApiError(res));
          }
          return res;
        } catch (err: any) {
          lastError = err;
          const canRetry = isNetworkError(err) && attempt < maxRetries;
          if (canRetry) {
            attempt++;
            await sleep(400 * attempt);
            continue;
          }
          throw err;
        }
      }
      throw lastError || new Error('Error de red');
    },
  }), [user, isInitializing, isLoadingUserData]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
