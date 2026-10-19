import React, { useState } from 'react';
import { 
  Plus, UserCheck, ShieldCheck, ChevronDown, Check, 
  Users, LogOut, Shield, User, HelpCircle 
} from 'lucide-react';

export default function Navbar({ 
  onNewAvaluo, 
  cloudStatus = 'conectado',
  currentRole = 'autorizador',
  onRoleChange,
  currentUser,
  onSignOut,
  onOpenUserManagement
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const canManageUsers = currentUser?.rol === 'admin' || currentUser?.rol === 'soporte';

  const getRoleDisplayName = () => {
    if (currentUser?.rol === 'admin') return 'Lic. Haroldo Ruiz (Dueño / Autorizador)';
    if (currentUser?.rol === 'soporte') return 'Ing. Ramiro Nóchez (Soporte Técnico)';
    if (currentUser?.rol === 'valuador') return 'Ing. Auxiliar (Valuador Técnico)';
    if (currentUser?.rol === 'lector') return 'Usuario de Consulta';
    return currentUser?.nombre || 'Usuario';
  };

  const getRoleBadge = () => {
    if (currentUser?.rol === 'admin') return 'Aprobador Oficial';
    if (currentUser?.rol === 'soporte') return 'SuperAdmin';
    if (currentUser?.rol === 'valuador') return 'Ingreso Técnico';
    return 'Lector';
  };

  const getInitials = () => {
    if (currentUser?.nombre) {
      return currentUser.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }
    return (currentUser?.email || 'LR').slice(0, 2).toUpperCase();
  };

  return (
    <header className="top-navbar" style={{ background: 'linear-gradient(135deg, #07172b 0%, #0d2847 50%, #16325c 100%)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <div className="navbar-content">
        {/* Brand Logo & Title */}
        <div className="brand-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '8px', padding: '4px 6px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <img 
              src="/lex-rosam-logo.png" 
              alt="Lex Rosam S.A." 
              style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/vite.svg';
              }}
            />
          </div>
          <div className="brand-text">
            <h1 style={{ color: '#ffffff', letterSpacing: '0.04em', fontSize: '1.25rem', margin: 0 }}>LEX ROSAM</h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.72rem', letterSpacing: '0.02em', textTransform: 'uppercase', margin: 0 }}>
              Sociedad Anónima · Avalúos
            </p>
          </div>
        </div>

        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Cloud Sync Status Badge */}
          <div 
            className="cloud-status-badge" 
            title={cloudStatus === 'conectado' ? 'Sincronizado en tiempo real con Firebase Firestore en la nube' : 'Modo Local / Conectando a la nube'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '0.35rem 0.65rem',
              borderRadius: '9999px',
              background: cloudStatus === 'conectado' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.18)',
              color: cloudStatus === 'conectado' ? '#38bdf8' : '#f59e0b',
              border: `1px solid ${cloudStatus === 'conectado' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
            }}
          >
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: cloudStatus === 'conectado' ? '#38bdf8' : '#f59e0b',
              display: 'inline-block',
              boxShadow: cloudStatus === 'conectado' ? '0 0 8px #38bdf8' : 'none'
            }} />
            <span className="desktop-only">{cloudStatus === 'conectado' ? 'En Línea' : 'Local'}</span>
          </div>

          {/* Botón de Gestión de Usuarios (visible para Haroldo y Ramiro) */}
          {canManageUsers && (
            <button
              type="button"
              onClick={onOpenUserManagement}
              title="Administrar colaboradores y permisos del equipo"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                padding: '0.45rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
            >
              <Users size={15} color="#93c5fd" />
              <span className="desktop-only">Colaboradores</span>
            </button>
          )}

          {/* User Profile & Account Menu */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="user-badge"
              onClick={() => setShowUserMenu(prev => !prev)}
              title="Cuenta y opciones de usuario"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div 
                className="user-avatar" 
                style={{ 
                  background: currentUser?.rol === 'admin' ? '#1e40af' : currentUser?.rol === 'soporte' ? '#6d28d9' : '#059669', 
                  color: '#ffffff',
                  width: '30px', 
                  height: '30px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}
              >
                {currentUser?.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.nombre} 
                    style={{ width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover' }} 
                  />
                ) : getInitials()}
              </div>
              <div className="desktop-only">
                <div style={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.1, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {currentUser?.nombre || currentUser?.displayName || 'Usuario'}
                  {currentUser?.rol === 'admin' && (
                    <ShieldCheck size={13} style={{ color: '#38bdf8' }} />
                  )}
                </div>
                <div style={{ fontSize: '0.68rem', opacity: 0.85, color: '#cbd5e1' }}>
                  {getRoleBadge()}
                </div>
              </div>
              <ChevronDown size={14} style={{ opacity: 0.7, marginLeft: '2px' }} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div 
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  width: '280px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                  border: '1px solid #e2e8f0',
                  padding: '8px',
                  zIndex: 200
                }}
              >
                {/* Header con datos del usuario activo */}
                <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d2847' }}>
                    {currentUser?.nombre || currentUser?.displayName || 'Usuario Activo'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', wordBreak: 'break-all' }}>
                    {currentUser?.email}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    marginTop: '4px',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    background: currentUser?.rol === 'admin' ? '#eff6ff' : '#f0fdf4',
                    color: currentUser?.rol === 'admin' ? '#1e40af' : '#15803d'
                  }}>
                    {getRoleBadge()}
                  </div>
                </div>

                {/* Acceso a Gestión de Usuarios si es Haroldo o Ramiro */}
                {canManageUsers && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onOpenUserManagement) onOpenUserManagement();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.82rem',
                      color: '#0d2847',
                      fontWeight: 600,
                      marginTop: '4px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Users size={16} color="#1e40af" />
                    <span>Control de Colaboradores</span>
                  </button>
                )}

                {/* Simulador rápido de rol (útil para Haroldo probar la vista del auxiliar) */}
                <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '6px', paddingTop: '6px' }}>
                  <div style={{ padding: '4px 12px', fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Simular vista de rol
                  </div>
                  <div 
                    onClick={() => {
                      if (onRoleChange) onRoleChange('autorizador');
                      setShowUserMenu(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      background: currentRole === 'autorizador' ? '#eff6ff' : 'transparent',
                      color: '#1e293b'
                    }}
                  >
                    <span>Lic. Haroldo Ruiz (Autorizador)</span>
                    {currentRole === 'autorizador' && <Check size={14} color="#2563eb" />}
                  </div>

                  <div 
                    onClick={() => {
                      if (onRoleChange) onRoleChange('ingreso');
                      setShowUserMenu(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      background: currentRole === 'ingreso' ? '#eff6ff' : 'transparent',
                      color: '#1e293b'
                    }}
                  >
                    <span>Ing. Auxiliar (Valuador Técnico)</span>
                    {currentRole === 'ingreso' && <Check size={14} color="#2563eb" />}
                  </div>
                </div>

                {/* Cerrar Sesión */}
                <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '6px', paddingTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onSignOut) onSignOut();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.82rem',
                      color: '#dc2626',
                      fontWeight: 600
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* New Avaluo Button (visible if user can create) */}
          <button 
            type="button" 
            className="btn-new-expediente" 
            onClick={onNewAvaluo}
            style={{
              background: 'linear-gradient(135deg, #1b497d 0%, #2563eb 100%)',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Plus size={18} />
            <span>Nuevo Avalúo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
