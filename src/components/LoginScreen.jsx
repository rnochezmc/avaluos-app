import React, { useState } from 'react';
import { Shield, AlertTriangle, Lock } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signInWithRedirect } from '../firebase';

export default function LoginScreen({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const result = await signInWithPopup(auth, googleProvider);
      if (result && result.user && onLoginSuccess) {
        onLoginSuccess(result.user);
      }
    } catch (err) {
      console.error('Error al iniciar sesión con Google:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Ventana de inicio de sesión cerrada. Si estás en celular, usa el enlace de pantalla completa abajo.');
        setLoading(false);
      } else if (err.code === 'auth/popup-blocked') {
        // En navegadores móviles con bloqueo de ventanas emergentes, redirigir
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          setErrorMsg('No se pudo abrir el acceso con Google: ' + redirectErr.message);
          setLoading(false);
        }
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg('Dominio no autorizado en Firebase Console. Por favor verifica la configuración de autenticación.');
        setLoading(false);
      } else {
        // En caso de otro error en móviles, intentar redirección directa
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          setErrorMsg('Error al autenticar con Google: ' + (err.message || 'Intenta nuevamente.'));
          setLoading(false);
        }
      }
    }
  };

  const handleGoogleSignInRedirect = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      console.error('Error en redirección de Google:', err);
      setErrorMsg('Error al abrir Google: ' + (err.message || 'Intenta nuevamente.'));
      setLoading(false);
    }
  };


  return (
    <div className="login-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, #1e3a5f 0%, #0d2847 45%, #07172b 100%)',
      padding: '1.5rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        padding: '2.75rem 2rem 2.25rem',
        textAlign: 'center'
      }}>
        {/* Logo de Lex Rosam */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <img 
            src="/lex-rosam-logo.png" 
            alt="LEX ROSAM S.A." 
            style={{ maxHeight: '95px', objectFit: 'contain' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/vite.svg';
            }}
          />
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.3rem 0.85rem',
          background: 'rgba(13, 40, 71, 0.08)',
          color: '#0d2847',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '1rem'
        }}>
          <Shield size={14} /> Control de Acceso y Valuación
        </div>

        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: '#0d2847',
          marginBottom: '0.4rem',
          lineHeight: 1.2
        }}>
          LEX ROSAM S.A.
        </h1>
        <p style={{
          fontSize: '0.9rem',
          color: '#64748b',
          marginBottom: '2rem',
          lineHeight: 1.4
        }}>
          Sistema Profesional de Registro, Valuación y Emisión de Avalúos
        </p>

        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontSize: '0.82rem',
            textAlign: 'left',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* Botón Exclusivo de Google Auth */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '10px',
            padding: '0.9rem 1.25rem',
            fontSize: '0.98rem',
            fontWeight: 600,
            color: '#1e293b',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.currentTarget.style.borderColor = '#0d2847';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(13, 40, 71, 0.15)';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.06)';
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                width: '18px',
                height: '18px',
                border: '2px solid #cbd5e1',
                borderTopColor: '#0d2847',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 1s linear infinite'
              }}></span>
              <span>Autenticando con Google...</span>
            </div>
          ) : (
            <>
              {/* Google Icon SVG */}
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continuar con Google</span>
            </>
          )}
        </button>

        {/* Opción para navegadores móviles con bloqueo de popups o dentro de WhatsApp */}
        <div style={{ marginTop: '0.85rem' }}>
          <button
            type="button"
            onClick={handleGoogleSignInRedirect}
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#2563eb',
              fontSize: '0.78rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '0.25rem 0.5rem',
              fontWeight: 500
            }}
          >
            ¿En celular o WhatsApp? Toca aquí para ingresar en pantalla completa
          </button>
        </div>

        <div style={{
          marginTop: '1.75rem',
          padding: '0.85rem 1rem',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          fontSize: '0.78rem',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          textAlign: 'left'
        }}>
          <Lock size={16} color="#0d2847" style={{ flexShrink: 0 }} />
          <span>
            Acceso restringido a colaboradores autorizados de <strong>LEX ROSAM S.A.</strong>
          </span>
        </div>

        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1rem',
          borderTop: '1px solid #f1f5f9',
          fontSize: '0.75rem',
          color: '#94a3b8'
        }}>
          LEX ROSAM S.A. © 2026 • Guatemala, C.A.
        </div>
      </div>
    </div>
  );
}
