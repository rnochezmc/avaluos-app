import React, { useState } from 'react';
import { 
  X, UserPlus, Users, Shield, Check, Trash2, Edit2, 
  AlertCircle, CheckCircle2, Key, Mail, User 
} from 'lucide-react';
import { saveUsuarioToCloud, deleteUsuarioFromCloud } from '../firebase';

export default function UserManagementModal({ 
  currentUser, 
  usuarios = [], 
  onClose, 
  onRefresh 
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const [formUser, setFormUser] = useState({
    nombre: '',
    email: '',
    rol: 'valuador',
    titulo: 'Valuador Técnico de Ingreso',
    activo: true
  });

  const resetForm = () => {
    setFormUser({
      nombre: '',
      email: '',
      rol: 'valuador',
      titulo: 'Valuador Técnico de Ingreso',
      activo: true
    });
    setEditingUserId(null);
    setShowAddForm(false);
  };

  const handleEdit = (u) => {
    setEditingUserId(u.id);
    const cleanNombre = u.email === 'rnochezmc@gmail.com' ? (u.nombre || '').replace(/^Ing\.\s*/i, '') : (u.nombre || '');
    setFormUser({
      nombre: cleanNombre,
      email: u.email || '',
      rol: u.rol || 'valuador',
      titulo: u.titulo || '',
      activo: u.activo !== false
    });
    setShowAddForm(true);
  };


  const handleDelete = async (u) => {
    if (u.email === 'rnochezmc@gmail.com' || u.email === 'cverdeavaluos@gmail.com' || u.email === 'aroldoruiz100@gmail.com') {
      alert('Esta es una cuenta maestra principal del sistema y no puede ser eliminada.');
      return;
    }
    if (!confirm(`¿Estás seguro de eliminar el acceso para ${u.nombre || u.email}?`)) {
      return;
    }
    try {
      setLoading(true);
      await deleteUsuarioFromCloud(u.id);
      setStatusMsg({ type: 'success', text: `Usuario ${u.email} eliminado exitosamente.` });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error eliminando usuario:', err);
      setStatusMsg({ type: 'error', text: 'Error al eliminar usuario: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!formUser.nombre.trim() || !formUser.email.trim()) {
      setStatusMsg({ type: 'error', text: 'El nombre y correo electrónico son obligatorios.' });
      return;
    }

    try {
      setLoading(true);
      setStatusMsg({ type: '', text: '' });

      const userToSave = {
        id: editingUserId || formUser.email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_'),
        nombre: formUser.nombre.trim(),
        email: formUser.email.toLowerCase().trim(),
        rol: formUser.rol,
        titulo: formUser.titulo.trim() || (
          formUser.rol === 'admin' ? 'Aprobador / Autorizador Oficial' : 
          formUser.rol === 'soporte' ? 'Soporte Técnico' : 
          formUser.rol === 'valuador' ? 'Valuador Técnico de Ingreso' : 'Usuario de Consulta'
        ),
        activo: Boolean(formUser.activo),
        actualizadoPor: currentUser?.nombre || currentUser?.email || 'Admin',
        creadoEl: new Date().toISOString()
      };

      await saveUsuarioToCloud(userToSave);
      setStatusMsg({ 
        type: 'success', 
        text: editingUserId ? 'Usuario actualizado exitosamente en la nube.' : 'Nuevo usuario registrado exitosamente en la nube.' 
      });
      resetForm();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error guardando usuario:', err);
      setStatusMsg({ type: 'error', text: 'Error al guardar usuario: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'admin':
        return { label: 'Dueño / Autorizador', bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' };
      case 'soporte':
        return { label: 'Soporte Técnico (SuperAdmin)', bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
      case 'valuador':
        return { label: 'Valuador Técnico (Ingreso)', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
      case 'lector':
        return { label: 'Consulta / Lector', bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
      default:
        return { label: rol, bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' };
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(13, 40, 71, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        overflow: 'hidden'
      }}>
        {/* Encabezado del Modal */}
        <div style={{
          padding: '1.25rem 1.75rem',
          background: 'linear-gradient(135deg, #0d2847 0%, #1e3a5f 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                Control de Usuarios y Roles — LEX ROSAM S.A.
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#93c5fd', margin: 0 }}>
                Administración de accesos para Aroldo Ruiz y equipo técnico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          {statusMsg.text && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: statusMsg.type === 'error' ? '#fef2f2' : '#f0fdf4',
              color: statusMsg.type === 'error' ? '#b91c1c' : '#15803d',
              border: `1px solid ${statusMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`
            }}>
              {statusMsg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Barra de acción: Agregar Usuario */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem'
          }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0d2847', margin: 0 }}>
                Usuarios Registrados ({usuarios.length})
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                Solo los usuarios con cuentas autorizadas pueden ingresar con su cuenta de Google.
              </p>
            </div>
            {!showAddForm && (
              <button
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                style={{
                  background: '#1e40af',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <UserPlus size={16} /> + Agregar Colaborador
              </button>
            )}
          </div>

          {/* Formulario de Alta / Edición */}
          {showAddForm && (
            <form onSubmit={handleSaveUser} style={{
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '0.5rem'
              }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0d2847' }}>
                  {editingUserId ? 'Editar Colaborador' : 'Registrar Nuevo Colaborador en LEX ROSAM'}
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Cancelar
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Ing. Carlos Morales"
                    value={formUser.nombre}
                    onChange={(e) => setFormUser({ ...formUser, nombre: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Correo Electrónico (Google / Gmail) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="colaborador@gmail.com"
                    value={formUser.email}
                    onChange={(e) => setFormUser({ ...formUser, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Rol y Nivel de Privilegios *
                  </label>
                  <select
                    value={formUser.rol}
                    onChange={(e) => setFormUser({ ...formUser, rol: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      background: '#ffffff'
                    }}
                  >
                    <option value="valuador">Valuador Técnico / Ingreso (Crea y envía a revisión)</option>
                    <option value="admin">Aprobador / Autorizador (Aroldo Ruiz / Revisor oficial)</option>
                    <option value="lector">Consulta / Lector (Solo lectura e impresión)</option>
                    <option value="soporte">Soporte Técnico / Desarrollador</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Cargo o Título Profesional
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Valuador Auxiliar 123-T-2026"
                    value={formUser.titulo}
                    onChange={(e) => setFormUser({ ...formUser, titulo: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formUser.activo}
                    onChange={(e) => setFormUser({ ...formUser, activo: e.target.checked })}
                  />
                  <span>Usuario Activo (Permitir acceso al sistema)</span>
                </label>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      padding: '0.55rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '0.55rem 1.25rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#0d2847',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Guardando...' : (editingUserId ? 'Actualizar Usuario' : 'Registrar Colaborador')}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Tabla de Usuarios */}
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: 600 }}>Usuario / Nombre</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: 600 }}>Correo (Google)</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: 600 }}>Rol Asignado</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: 600 }}>Estado</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: 600, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  const badge = getRoleBadge(u.rol);
                  return (
                    <tr key={u.id || u.email} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#0d2847' }}>
                          {u.email === 'rnochezmc@gmail.com' ? (u.nombre || 'Ramiro Nóchez').replace(/^Ing\.\s*/i, '') : (u.nombre || 'Sin nombre')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.titulo || 'Personal Técnico'}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>
                        {u.email}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {u.activo !== false ? (
                          <span style={{ color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Check size={14} /> Activo
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontWeight: 600 }}>Inactivo</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleEdit(u)}
                            title="Editar permisos"
                            style={{
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '0.35rem 0.5rem',
                              cursor: 'pointer',
                              color: '#1e40af'
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          {u.email !== 'rnochezmc@gmail.com' && u.email !== 'cverdeavaluos@gmail.com' && u.email !== 'aroldoruiz100@gmail.com' && (
                            <button
                              onClick={() => handleDelete(u)}
                              title="Eliminar usuario"
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                padding: '0.35rem 0.5rem',
                                cursor: 'pointer',
                                color: '#b91c1c'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{
            marginTop: '1.25rem',
            padding: '0.85rem 1rem',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#0369a1'
          }}>
            <strong>Nota para Aroldo Ruiz:</strong> Cuando un valuador técnico inicie sesión con su cuenta de Google, solo podrá crear expedientes y enviarlos a autorización. Solo los usuarios con rol de <strong>Aprobador / Autorizador</strong> pueden dar la firma y certificación oficial al avalúo.
          </div>
        </div>

        {/* Pie del modal */}
        <div style={{
          padding: '1rem 1.75rem',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#334155'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
