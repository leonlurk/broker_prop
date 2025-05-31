import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ActionRedirector() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    if (mode === 'resetPassword') {
      // Redirige a /verification manteniendo los parámetros
      navigate(`/verification${location.search}`, { replace: true });
    }
    // Puedes agregar más casos para otros modos si lo necesitas
  }, [location, navigate]);

  return null;
} 