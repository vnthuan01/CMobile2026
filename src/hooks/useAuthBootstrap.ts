import { useEffect } from 'react';
import { authService } from '../services/authService';

export function useAuthBootstrap() {
  useEffect(() => {
    void authService.restoreToken();
  }, []);
}
