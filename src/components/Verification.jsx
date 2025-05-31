import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAuth, confirmPasswordReset } from 'firebase/auth';

export default function Verification() {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (!oobCode) {
      setError('Código de verificación inválido.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const auth = getAuth();
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
    } catch (err) {
      setError('Error al restablecer la contraseña. El enlace puede haber expirado o ya fue usado.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#232323] text-white">
        <div className="bg-[#2c2c2c] p-8 rounded-xl shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">¡Contraseña restablecida!</h2>
          <p>Tu contraseña fue cambiada con éxito. Ya puedes iniciar sesión con tu nueva contraseña.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#232323] text-white">
      <form onSubmit={handleReset} className="bg-[#2c2c2c] p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Restablecer contraseña</h2>
        <div className="mb-4">
          <label className="block mb-2">Nueva contraseña</label>
          <input
            type="password"
            className="w-full px-4 py-2 rounded-lg bg-[#232323] border border-gray-700 focus:outline-none focus:border-cyan-500 text-white"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Confirmar nueva contraseña</label>
          <input
            type="password"
            className="w-full px-4 py-2 rounded-lg bg-[#232323] border border-gray-700 focus:outline-none focus:border-cyan-500 text-white"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        <button
          type="submit"
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          disabled={loading}
        >
          {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
        </button>
      </form>
    </div>
  );
} 