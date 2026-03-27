import RequestsScreen from '@/app/(tabs)/requests/index';
import '@/global.css';
import CitizenProfile from '@/src/components/profile/CitizenProfile';
import RegisterVolunteerScreen from '@/src/components/profile/RegisterVolunteerScreen';
import UpdateProfileCitizenScreen from '@/src/components/profile/UpdateProfileCitizenScreen';
import UpdateProfileVolunteerScreen from '@/src/components/profile/UpdateProfileVolunteerScreen';
import VolunteerProfile from '@/src/components/profile/VolunteerProfile';
import ChangePasswordScreen from '@/src/components/screens/ChangePasswordScreen';
import HelpScreen from '@/src/components/screens/HelpScreen';
import SettingsScreen from '@/src/components/screens/SettingsScreen';
import MyCurrentTeamScreen from '@/src/components/team/MyCurrentTeamScreen';
import AllocateTaskScreen from '@/src/components/teamleader/AllocateTaskScreen';
import DashboardTeamLeaderScreen from '@/src/components/teamleader/DashboardTeamLeaderScreen';
import ReportProgressTeamLeaderScreen from '@/src/components/teamleader/ReportProgressTeamLeaderScreen';
import TeamTasksScreen from '@/src/components/volunteer/TeamTasksScreen';
import NewSOSForVolunteerScreen from '@/src/components/volunteer/NewSOSForVolunteerScreen';
import ProgressForReliefScreen from '@/src/components/volunteer/ProgressForReliefScreen';
import ProgressForRescueScreen from '@/src/components/volunteer/ProgressForRescueScreen';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuthStore } from '@/src/store/authStore';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ProfileScreenType =
  | 'profile'
  | 'requests'
  | 'tasks'
  | 'settings'
  | 'help'
  | 'edit-profile'
  | 'progress-rescue'
  | 'progress-relief'
  | 'new-sos'
  | 'dashboard-leader'
  | 'allocate-task'
  | 'report-leader'
  | 'change-password'
  | 'register-volunteer'
  | 'my-team';

const ACCENT_COLOR = '#DA251D';

export default function ProfileScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const params = useLocalSearchParams();
  const [currentScreen, setCurrentScreen] =
    useState<ProfileScreenType>('profile');

  const { colors, isDark } = useTheme();
  const headerBg = isDark ? 'bg-gray-700' : 'bg-primary/10';

  const role = (user?.role ?? '').toLowerCase();
  const isVolunteer = role === 'volunteer';

  // const isTeamLeader = !!(user as any)?.isTeamLeader;

  useEffect(() => {
    if (params.view) {
      setCurrentScreen(params.view as ProfileScreenType);
    }
  }, [params.view]);

  // ─── FIX: Reset stack khi rời tab ───
  // Khi user click sang tab khác → cleanup resets về 'profile'
  // Lần sau quay lại tab Profile sẽ thấy profile root, không bị kẹt sub-screen
  useFocusEffect(
    useCallback(() => {
      // focus → no-op (giữ nguyên sub-screen)
      return () => {
        // blur → reset về profile root
        setCurrentScreen('profile');
      };
    }, []),
  );

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  // ─── Citizen Screens ───
  if (currentScreen === 'requests') {
    return <RequestsScreen onBack={() => setCurrentScreen('profile')} />;
  }

  // ─── Shared Screens ───
  if (currentScreen === 'settings') {
    return <SettingsScreen onBack={() => setCurrentScreen('profile')} />;
  }
  if (currentScreen === 'help') {
    return <HelpScreen onBack={() => setCurrentScreen('profile')} />;
  }
  if (currentScreen === 'change-password') {
    return <ChangePasswordScreen onBack={() => setCurrentScreen('profile')} />;
  }

  // ─── Profile Edit ───
  if (currentScreen === 'edit-profile') {
    return isVolunteer ? (
      <UpdateProfileVolunteerScreen
        onBack={() => setCurrentScreen('profile')}
      />
    ) : (
      <UpdateProfileCitizenScreen onBack={() => setCurrentScreen('profile')} />
    );
  }

  if (currentScreen === 'register-volunteer') {
    return (
      <RegisterVolunteerScreen
        onBack={() => setCurrentScreen('profile')}
        onSuccess={() => setCurrentScreen('profile')}
      />
    );
  }

  if (currentScreen === 'my-team') {
    return (
      <MyCurrentTeamScreen
        onBack={() => setCurrentScreen('profile')}
        onOpenTasks={() => setCurrentScreen('tasks')}
      />
    );
  }

  // ─── Volunteer Screens ───
  if (currentScreen === 'tasks') {
    return <TeamTasksScreen onBack={() => setCurrentScreen('profile')} />;
  }
  if (currentScreen === 'progress-rescue') {
    return (
      <ProgressForRescueScreen
        onBack={() => setCurrentScreen('profile')}
        onMarkSOS={() => setCurrentScreen('new-sos')}
      />
    );
  }
  if (currentScreen === 'progress-relief') {
    return (
      <ProgressForReliefScreen
        onBack={() => setCurrentScreen('profile')}
        onMarkSOS={() => setCurrentScreen('new-sos')}
      />
    );
  }
  if (currentScreen === 'new-sos') {
    return (
      <NewSOSForVolunteerScreen onBack={() => setCurrentScreen('profile')} />
    );
  }

  // ─── Team Leader Screens ───
  if (currentScreen === 'dashboard-leader') {
    return (
      <DashboardTeamLeaderScreen
        onBack={() => setCurrentScreen('profile')}
        onAllocateTask={() => setCurrentScreen('allocate-task')}
      />
    );
  }
  if (currentScreen === 'allocate-task') {
    return (
      <AllocateTaskScreen onBack={() => setCurrentScreen('dashboard-leader')} />
    );
  }
  if (currentScreen === 'report-leader') {
    return (
      <ReportProgressTeamLeaderScreen
        onBack={() => setCurrentScreen('dashboard-leader')}
      />
    );
  }

  return isVolunteer ? (
    <VolunteerProfile
      onLogout={handleLogout}
      onNavigate={(s) => setCurrentScreen(s)}
      onEdit={() => setCurrentScreen('edit-profile')}
    />
  ) : (
    <CitizenProfile
      onLogout={handleLogout}
      onNavigate={(s) => setCurrentScreen(s)}
      onEdit={() => setCurrentScreen('edit-profile')}
    />
  );
}
