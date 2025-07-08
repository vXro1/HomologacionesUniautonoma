import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  School,
  AlertCircle,
  RefreshCw,
  Bell,
  Eye
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSolicitudes: 0,
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0
  });

  const [solicitudes, setSolicitudes] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  // Función para mostrar alertas
  const showAlert = (message, type = 'info') => {
    // Implementar sistema de alertas toast aquí
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  // Función para cargar datos desde la API
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/solicitudes`);

      if (!response.ok) {
        throw new Error('Error al cargar los datos');
      }

      const data = await response.json();
      setSolicitudes(data);

      // Procesar datos para estadísticas
      const totalSolicitudes = data.length;
      const pendientes = data.filter(s => s.estado === 'Radicado' || s.estado === 'En revisión').length;
      const aprobadas = data.filter(s => s.estado === 'Aprobado').length;
      const rechazadas = data.filter(s => s.estado === 'Rechazado').length;

      setStats({
        totalSolicitudes,
        pendientes,
        aprobadas,
        rechazadas
      });

      // Actualizar notificaciones
      actualizarNotificaciones(data);

      showAlert('Datos actualizados correctamente', 'success');
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      showAlert('Error al cargar los datos. Intente más tarde.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar notificaciones
  const actualizarNotificaciones = (solicitudes) => {
    const solicitudesOrdenadas = [...solicitudes].sort((a, b) => {
      return new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud);
    });

    let nuevasNotificaciones = [];

    // Solicitudes recientes (últimas 24 horas)
    const ultimasDia = solicitudesOrdenadas.filter(s => {
      const fechaSolicitud = new Date(s.fecha_solicitud);
      const ahora = new Date();
      const diff = ahora - fechaSolicitud;
      return diff < 24 * 60 * 60 * 1000;
    });

    if (ultimasDia.length > 0) {
      nuevasNotificaciones.push({
        id: 'nuevas-solicitudes',
        mensaje: `${ultimasDia.length} nueva${ultimasDia.length > 1 ? 's' : ''} solicitud${ultimasDia.length > 1 ? 'es' : ''} en las últimas 24 horas`,
        tipo: 'info',
        fecha: new Date(),
        icono: <Bell className="w-4 h-4" />
      });
    }

    // Solicitudes pendientes por más de 7 días
    const pendientesDemoradas = solicitudesOrdenadas.filter(s => {
      if (s.estado === 'Radicado' || s.estado === 'En revisión') {
        const fechaSolicitud = new Date(s.fecha_solicitud);
        const ahora = new Date();
        const diff = ahora - fechaSolicitud;
        return diff > 7 * 24 * 60 * 60 * 1000;
      }
      return false;
    });

    if (pendientesDemoradas.length > 0) {
      nuevasNotificaciones.push({
        id: 'pendientes-demoradas',
        mensaje: `${pendientesDemoradas.length} solicitud${pendientesDemoradas.length > 1 ? 'es' : ''} pendiente${pendientesDemoradas.length > 1 ? 's' : ''} por más de 7 días`,
        tipo: 'warning',
        fecha: new Date(),
        icono: <AlertCircle className="w-4 h-4" />
      });
    }

    // Solicitudes aprobadas recientemente
    const aprobadasRecientes = solicitudesOrdenadas.filter(s => s.estado === 'Aprobado').slice(0, 3);
    aprobadasRecientes.forEach((solicitud, index) => {
      nuevasNotificaciones.push({
        id: `aprobada-${solicitud.id}`,
        mensaje: `Solicitud ${solicitud.numero_radicado} de ${solicitud.primer_nombre} ${solicitud.primer_apellido} aprobada`,
        tipo: 'success',
        fecha: new Date(solicitud.fecha_solicitud),
        icono: <CheckCircle className="w-4 h-4" />
      });
    });

    // Solicitudes rechazadas recientemente
    const rechazadasRecientes = solicitudesOrdenadas.filter(s => s.estado === 'Rechazado').slice(0, 3);
    rechazadasRecientes.forEach((solicitud, index) => {
      nuevasNotificaciones.push({
        id: `rechazada-${solicitud.id}`,
        mensaje: `Solicitud ${solicitud.numero_radicado} de ${solicitud.primer_nombre} ${solicitud.primer_apellido} rechazada`,
        tipo: 'error',
        fecha: new Date(solicitud.fecha_solicitud),
        icono: <XCircle className="w-4 h-4" />
      });
    });

    setNotificaciones(nuevasNotificaciones);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();

    // Actualizar datos cada 5 minutos
    const interval = setInterval(cargarDatos, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Componente para las tarjetas de estadísticas
  const StatsCard = ({ title, value, icon: Icon, color, borderColor }) => (
    <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border-l-4 ${borderColor} hover:scale-105`}>
      <div className="p-6 flex items-center">
        <div className={`p-3 rounded-full ${color} mr-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
            ) : (
              value
            )}
          </h3>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </div>
    </div>
  );

  // Componente para las notificaciones
  const NotificationItem = ({ notification }) => {
    const getNotificationStyle = (tipo) => {
      switch (tipo) {
        case 'success':
          return 'border-l-green-500 bg-green-50';
        case 'warning':
          return 'border-l-yellow-500 bg-yellow-50';
        case 'error':
          return 'border-l-red-500 bg-red-50';
        default:
          return 'border-l-blue-500 bg-blue-50';
      }
    };

    return (
      <div className={`p-3 mb-2 border-l-4 rounded-r-lg transition-all duration-200 hover:bg-gray-50 hover:translate-x-1 ${getNotificationStyle(notification.tipo)}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <div className="mr-2 mt-1">
              {notification.icono}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{notification.mensaje}</p>
              <p className="text-xs text-gray-500 mt-1">
                {notification.fecha.toLocaleString('es-CO', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente para las últimas solicitudes
  const SolicitudItem = ({ solicitud }) => {
    const getStatusColor = (estado) => {
      switch (estado) {
        case 'Aprobado':
          return 'bg-green-100 text-green-800';
        case 'Rechazado':
          return 'bg-red-100 text-red-800';
        case 'En revisión':
          return 'bg-yellow-100 text-yellow-800';
        default:
          return 'bg-blue-100 text-blue-800';
      }
    };

    return (
      <div className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h4 className="font-semibold text-gray-800 mr-3">
                {solicitud.primer_nombre} {solicitud.primer_apellido}
              </h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(solicitud.estado)}`}>
                {solicitud.estado}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-4">#{solicitud.numero_radicado}</span>
              <span>{solicitud.institucion_origen_nombre}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-CO')}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error de Conexión</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={cargarDatos}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center mx-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 mb-2">
                Panel de Homologación
              </h1>
              <div className="h-1 w-16 bg-blue-500 rounded-full"></div>
            </div>
            <button
              onClick={cargarDatos}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total de solicitudes"
            value={stats.totalSolicitudes}
            icon={FileText}
            color="bg-blue-500"
            borderColor="border-blue-500"
          />
          <StatsCard
            title="Pendientes por revisar"
            value={stats.pendientes}
            icon={Clock}
            color="bg-yellow-500"
            borderColor="border-yellow-500"
          />
          <StatsCard
            title="Solicitudes aprobadas"
            value={stats.aprobadas}
            icon={CheckCircle}
            color="bg-green-500"
            borderColor="border-green-500"
          />
          <StatsCard
            title="Solicitudes rechazadas"
            value={stats.rechazadas}
            icon={XCircle}
            color="bg-red-500"
            borderColor="border-red-500"
          />
        </div>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Últimas Solicitudes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm h-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Últimas Solicitudes</h2>
                <button className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  Ver todas
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : solicitudes.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No hay solicitudes recientes
                  </div>
                ) : (
                  <div>
                    {solicitudes
                      .sort((a, b) => new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud))
                      .slice(0, 8)
                      .map((solicitud) => (
                        <SolicitudItem key={solicitud.id} solicitud={solicitud} />
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm h-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Notificaciones</h2>
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {notificaciones.length}
                </span>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : notificaciones.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay notificaciones nuevas</p>
                  </div>
                ) : (
                  <div>
                    {notificaciones.map((notificacion) => (
                      <NotificationItem key={notificacion.id} notification={notificacion} />
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200 text-center">
                <button className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                  Marcar todas como leídas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
