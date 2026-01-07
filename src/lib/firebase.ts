import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (브라우저 환경에서만)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// 커스텀 이벤트 로깅 함수들
export const logSpinRoulette = (participantCount: number) => {
  if (analytics) {
    logEvent(analytics, 'spin_roulette', {
      participant_count: participantCount,
    });
  }
};

export const logSpinComplete = (winner: string, participantCount: number) => {
  if (analytics) {
    logEvent(analytics, 'spin_complete', {
      winner_name: winner,
      participant_count: participantCount,
    });
  }
};

export const logGroupSave = (groupName: string, memberCount: number) => {
  if (analytics) {
    logEvent(analytics, 'group_save', {
      group_name: groupName,
      member_count: memberCount,
    });
  }
};

export const logGroupLoad = (groupName: string, memberCount: number) => {
  if (analytics) {
    logEvent(analytics, 'group_load', {
      group_name: groupName,
      member_count: memberCount,
    });
  }
};

export const logAddParticipant = () => {
  if (analytics) {
    logEvent(analytics, 'add_participant');
  }
};

export const logToggleDarkMode = (isDark: boolean) => {
  if (analytics) {
    logEvent(analytics, 'toggle_dark_mode', {
      is_dark: isDark,
    });
  }
};

export { app, analytics };
