"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, RotateCcw, Edit, Info, Calendar, User, Mail, MapPin, GraduationCap, FileText, Filter, Download, Plus, Bell, Settings } from 'lucide-react';

const CoordinadorDashboard = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    estado: '',
    fecha: '',
    carrera: '',
    estudiante: ''
  });

  // Cargar datos desde la API
  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/solicitudes');

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setSolicitudes(data);
        setError(null);
      } catch (err) {
        setError(`No se pudieron cargar los datos: ${err.message}`);
        setSolicitudes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, []);

  // Filtrar solicitudes
  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter(solicitud => {
      // Construir nombre completo
      const nombreCompleto = `${solicitud.primer_nombre || ''} ${solicitud.segundo_nombre || ''} ${solicitud.primer_apellido || ''} ${solicitud.segundo_apellido || ''}`.trim();

      // Filtro por estado
      if (filtros.estado && !solicitud.estado?.toLowerCase().includes(filtros.estado.toLowerCase())) {
        return false;
      }

      // Filtro por fecha
      if (filtros.fecha) {
        const fechaSolicitud = new Date(solicitud.fecha_solicitud).toISOString().split('T')[0];
        if (fechaSolicitud !== filtros.fecha) {
          return false;
        }
      }

      // Filtro por carrera
      if (filtros.carrera && !solicitud.programa_destino_nombre?.toLowerCase().includes(filtros.carrera.toLowerCase())) {
        return false;
      }

      // Filtro por estudiante (nombre o número de radicado)
      if (filtros.estudiante) {
        const busqueda = filtros.estudiante.toLowerCase();
        const cumpleNombre = nombreCompleto.toLowerCase().includes(busqueda);
        const cumpleRadicado = solicitud.numero_radicado?.toLowerCase().includes(busqueda);

        if (!cumpleNombre && !cumpleRadicado) {
          return false;
        }
      }

      return true;
    });
  }, [solicitudes, filtros]);

  // Manejar cambios en filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      fecha: '',
      carrera: '',
      estudiante: ''
    });
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    try {
      return new Date(fecha).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  // Obtener clase para badge de estado
  const getBadgeClass = (estado) => {
    const estadoLower = estado?.toLowerCase() || '';

    if (estadoLower.includes('aprobado')) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (estadoLower.includes('rechazado')) return 'bg-red-50 text-red-700 border border-red-200';
    if (estadoLower.includes('revisión')) return 'bg-amber-50 text-amber-700 border border-amber-200';
    if (estadoLower.includes('radicado')) return 'bg-sky-50 text-sky-700 border border-sky-200';
    return 'bg-slate-50 text-slate-700 border border-slate-200';
  };

  // Obtener estados únicos para el select
  const estadosUnicos = useMemo(() => {
    const estados = [...new Set(solicitudes.map(s => s.estado).filter(Boolean))];
    return estados.sort();
  }, [solicitudes]);

  // Obtener carreras únicas para el select
  const carrerasUnicas = useMemo(() => {
    const carreras = [...new Set(solicitudes.map(s => s.programa_destino_nombre).filter(Boolean))];
    return carreras.sort();
  }, [solicitudes]);

  // Estadísticas rápidas
  const estadisticas = useMemo(() => {
    const total = solicitudes.length;
    const pendientes = solicitudes.filter(s => s.estado?.toLowerCase().includes('radicado')).length;
    const enRevision = solicitudes.filter(s => s.estado?.toLowerCase().includes('revisión')).length;
    const aprobadas = solicitudes.filter(s => s.estado?.toLowerCase().includes('aprobado')).length;

    return { total, pendientes, enRevision, aprobadas };
  }, [solicitudes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-2xl border border-white/20 max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 absolute top-0 left-0"></div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Cargando solicitudes...</h3>
              <p className="text-slate-600">Obteniendo datos del sistema</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header con navegación */}
      <div className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-3 rounded-xl">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-cyan-600 bg-clip-text text-transparent">
                  Sistema de Homologaciones
                </h1>
                <p className="text-slate-600">Panel de Coordinación</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
                <Settings className="w-5 h-5" />
              </button>
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-xl font-medium">
                Coordinador
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Error State */}
        {error && (
          <div className="mb-8 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-xl">
                <svg className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error al cargar datos</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Solicitudes</p>
                <p className="text-3xl font-bold text-slate-800">{estadisticas.total}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-3 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pendientes</p>
                <p className="text-3xl font-bold text-amber-600">{estadisticas.pendientes}</p>
              </div>
              <div className="bg-gradient-to-r from-amber-500 to-orange-400 p-3 rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">En Revisión</p>
                <p className="text-3xl font-bold text-blue-600">{estadisticas.enRevision}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-400 p-3 rounded-xl">
                <Search className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Aprobadas</p>
                <p className="text-3xl font-bold text-emerald-600">{estadisticas.aprobadas}</p>
              </div>
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-3 rounded-xl">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Panel de filtros */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Filter className="w-6 h-6 mr-3" />
              Filtros de Búsqueda
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Filtro Estado */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Estado de Solicitud
                </label>
                <select
                  value={filtros.estado}
                  onChange={(e) => handleFiltroChange('estado', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-700"
                >
                  <option value="">Todos los estados</option>
                  {estadosUnicos.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Fecha */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Fecha de Solicitud
                </label>
                <input
                  type="date"
                  value={filtros.fecha}
                  onChange={(e) => handleFiltroChange('fecha', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-700"
                />
              </div>

              {/* Filtro Carrera */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Programa Académico
                </label>
                <select
                  value={filtros.carrera}
                  onChange={(e) => handleFiltroChange('carrera', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-700"
                >
                  <option value="">Todos los programas</option>
                  {carrerasUnicas.map(carrera => (
                    <option key={carrera} value={carrera}>{carrera}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Estudiante */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Buscar Estudiante
                </label>
                <input
                  type="text"
                  value={filtros.estudiante}
                  onChange={(e) => handleFiltroChange('estudiante', e.target.value)}
                  placeholder="Nombre o número de radicado..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-700"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={limpiarFiltros}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200 flex items-center space-x-2 font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Limpiar Filtros</span>
                </button>

                <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 font-medium">
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
              </div>

              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg">
                <Plus className="w-4 h-4" />
                <span>Nueva Solicitud</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de solicitudes */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-blue-900 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FileText className="w-6 h-6 mr-3" />
                Gestión de Solicitudes
              </h2>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                <span className="text-white font-medium">
                  {solicitudesFiltradas.length} de {solicitudes.length} solicitudes
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {solicitudesFiltradas.length === 0 ? (
              <div className="p-16 text-center">
                <div className="max-w-lg mx-auto">
                  <div className="bg-gradient-to-r from-blue-100 to-cyan-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    No se encontraron solicitudes
                  </h3>
                  <p className="text-slate-600 text-lg">
                    {Object.values(filtros).some(v => v)
                      ? 'Intenta ajustar los filtros de búsqueda para encontrar lo que necesitas'
                      : 'No hay solicitudes disponibles en este momento'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Radicado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Programa
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Institución
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {solicitudesFiltradas.map((solicitud, index) => {
                    const nombreCompleto = `${solicitud.primer_nombre || ''} ${solicitud.segundo_nombre || ''} ${solicitud.primer_apellido || ''} ${solicitud.segundo_apellido || ''}`.trim();
                    const estado = solicitud.estado?.toLowerCase() || '';

                    return (
                      <tr
                        key={solicitud.id_solicitud}
                        className={`hover:bg-blue-50/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-2 rounded-lg">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-bold text-slate-800">
                              {solicitud.numero_radicado || 'N/A'}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-2 rounded-lg">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-800">
                                {nombreCompleto || 'Nombre no disponible'}
                              </div>
                              <div className="text-xs text-slate-500 font-medium">
                                {solicitud.tipo_identificacion} {solicitud.numero_identificacion}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-400 p-2 rounded-lg">
                              <GraduationCap className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 max-w-xs truncate">
                              {solicitud.programa_destino_nombre || 'Programa no disponible'}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-slate-700">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <span className="font-medium truncate max-w-40">
                                {solicitud.email || 'No disponible'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-slate-500">
                              <span className="text-slate-400">📱</span>
                              <span className="font-medium">
                                {solicitud.telefono || 'No disponible'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-amber-500 to-orange-400 p-2 rounded-lg">
                              <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                              {formatearFecha(solicitud.fecha_solicitud)}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-rose-500 to-pink-400 p-2 rounded-lg">
                              <MapPin className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 max-w-xs truncate">
                              {solicitud.institucion_origen_nombre || 'No disponible'}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getBadgeClass(solicitud.estado)}`}>
                            {solicitud.estado || 'Sin estado'}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-3">
                            {estado === 'cerrado' ? (
                              <button
                                disabled
                                title="No se puede editar una solicitud cerrada"
                                className="p-3 text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  console.log('Editar solicitud:', solicitud.numero_radicado);
                                }}
                                title="Editar solicitud"
                                className="p-3 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                console.log('Ver información:', solicitud.numero_radicado);
                              }}
                              title="Ver información de homologación"
                              className="p-3 text-cyan-600 bg-cyan-100 hover:bg-cyan-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinadorDashboard;
