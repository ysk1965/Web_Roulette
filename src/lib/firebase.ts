import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDGYVNdPOh1b4Sf-XC940Ctzi1zdOD-gsw",
  authDomain: "webroulette-40a7a.firebaseapp.com",
  projectId: "webroulette-40a7a",
  storageBucket: "webroulette-40a7a.firebasestorage.app",
  messagingSenderId: "106675144930",
  appId: "1:106675144930:web:eea480535d18d10d2c36bb",
  measurementId: "G-B3MB3RQ49V"
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
