import { useEffect } from 'react';
import { authService } from '../services/authService';

export function useAuthBootstrap() {
  useEffect(() => {
    authService.restoreToken();
  }, []);
}
