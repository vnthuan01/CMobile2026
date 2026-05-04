import { rescueTeamService } from '@/src/services/rescueTeamService';

export function useRescueTeamActions() {
  return {
    callReporter: (phone?: string | null) => rescueTeamService.openCallReporter(phone),
  };
}
