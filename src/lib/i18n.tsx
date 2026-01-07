import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ko' | 'en';

const translations = {
  ko: {
    // Header
    appTitle: '커피 네이버 룰렛',
    appDescription: '오늘 누가 커피를 쏠까요? 룰렛을 돌려보세요!',

    // Roulette
    spinning: '돌아가는 중...',
    spinButton: '룰렛 돌리기 🎲',
    minParticipants: '최소 2명 이상의 참가자가 필요합니다!',

    // Participant
    participantManagement: '참가자 관리',
    addParticipant: '참가자 추가',
    participantPlaceholder: '이름 입력',
    shuffleOrder: '순서 섞기',
    noParticipants: '참가자가 없습니다',
    addParticipantGuide: '위에서 참가자를 추가해주세요',
    participants: '명',

    // Group
    savedGroups: '저장된 그룹',
    saveCurrentGroup: '저장',
    saveGroup: '현재 그룹 저장',
    groupNamePlaceholder: '그룹 이름 (예: 개발팀)',
    save: '저장',
    cancel: '취소',
    load: '불러오기',
    delete: '삭제',
    active: '활성',
    noGroups: '저장된 그룹이 없습니다',
    noGroupsGuide: '참가자를 추가하고 그룹을 저장해보세요',
    totalGroups: '개 그룹 저장됨',
    totalRounds: '회 진행',
    winRecord: '당첨 기록:',
    reset: '초기화',
    confirmDeleteGroup: '이 그룹을 삭제하시겠습니까?',
    confirmResetStats: '이 그룹의 당첨 기록을 초기화하시겠습니까?',
    enterGroupName: '그룹 이름을 입력해주세요!',
    noParticipantsToSave: '저장할 참가자가 없습니다!',
    currentParticipants: '현재 참가자',
    peopleToSave: '명을 저장합니다',

    // Winner Dialog
    congratulations: '🎉 당첨 축하합니다! 🎉',
    winnerAnnouncement: '님이 커피를 쏩니다!',
    coffeeRequest: '☕ 맛있는 커피 한 잔 부탁드립니다 ☕',
    saveResult: '이 결과를 기록하시겠어요?',
    saveAsGroup: '그룹으로 저장하고 기록하기',
    resultSaved: '✓ 결과가 그룹에 자동으로 기록되었습니다',
    winRecordTitle: '당첨 기록',
    totalRoundsLabel: '총',
    roundsUnit: '회',
    confirm: '확인',

    // How to use
    howToUse: '사용 방법',
    step1: '참가자 이름을 추가하세요 (최소 2명)',
    step2: '자주 사용하는 그룹은 저장해두고 불러올 수 있습니다',
    step3: '"룰렛 돌리기" 버튼을 클릭하세요',
    step4: '룰렛이 돌아가고 당첨자가 결정됩니다',
    step5: '당첨된 사람이 커피를 사주면 됩니다! ☕',
    step6: '저장된 그룹을 사용하면 당첨 기록이 자동 저장됩니다',

    // Footer
    copyright: '© 2024 커피 룰렛. 공정한 커피 내기를 위해 만들어졌습니다.',

    // Ad
    adArea: '광고 영역',

    // Tutorial
    tutorialTitle: '환영합니다! 👋',
    tutorialMessage: '참가자 이름을 입력하고 + 버튼을 눌러 추가해보세요!',
    tutorialDismiss: '알겠어요',

    // Share
    shareResult: '결과 공유하기',
    shareKakao: '카카오톡',
    shareTwitter: '트위터',
    shareCopyLink: '링크 복사',
    linkCopied: '링크가 복사되었습니다!',
    shareMessage: '🎉 오늘 커피 당첨자: {winner}!\n커피 룰렛으로 공정하게 정했어요',
  },
  en: {
    // Header
    appTitle: 'Coffee Roulette',
    appDescription: "Who's buying coffee today? Spin the wheel!",

    // Roulette
    spinning: 'Spinning...',
    spinButton: 'Spin the Wheel 🎲',
    minParticipants: 'At least 2 participants are required!',

    // Participant
    participantManagement: 'Participants',
    addParticipant: 'Add Participant',
    participantPlaceholder: 'Enter name',
    shuffleOrder: 'Shuffle',
    noParticipants: 'No participants',
    addParticipantGuide: 'Add participants above',
    participants: '',

    // Group
    savedGroups: 'Saved Groups',
    saveCurrentGroup: 'Save',
    saveGroup: 'Save Current Group',
    groupNamePlaceholder: 'Group name (e.g., Dev Team)',
    save: 'Save',
    cancel: 'Cancel',
    load: 'Load',
    delete: 'Delete',
    active: 'Active',
    noGroups: 'No saved groups',
    noGroupsGuide: 'Add participants and save as a group',
    totalGroups: ' groups saved',
    totalRounds: ' rounds',
    winRecord: 'Win Record:',
    reset: 'Reset',
    confirmDeleteGroup: 'Delete this group?',
    confirmResetStats: 'Reset win records for this group?',
    enterGroupName: 'Please enter a group name!',
    noParticipantsToSave: 'No participants to save!',
    currentParticipants: 'Current participants',
    peopleToSave: ' will be saved',

    // Winner Dialog
    congratulations: '🎉 Congratulations! 🎉',
    winnerAnnouncement: ' buys coffee!',
    coffeeRequest: '☕ Enjoy your coffee! ☕',
    saveResult: 'Save this result?',
    saveAsGroup: 'Save as group and record',
    resultSaved: '✓ Result automatically recorded',
    winRecordTitle: 'Win Record',
    totalRoundsLabel: 'Total',
    roundsUnit: ' rounds',
    confirm: 'OK',

    // How to use
    howToUse: 'How to Use',
    step1: 'Add participant names (min. 2)',
    step2: 'Save frequently used groups for later',
    step3: 'Click "Spin the Wheel" button',
    step4: 'The wheel spins and picks a winner',
    step5: 'The winner buys coffee! ☕',
    step6: 'Win records are auto-saved for saved groups',

    // Footer
    copyright: '© 2024 Coffee Roulette. Made for fair coffee bets.',

    // Ad
    adArea: 'Ad Space',

    // Share
    shareResult: 'Share Result',
    shareKakao: 'KakaoTalk',
    shareTwitter: 'Twitter',
    shareCopyLink: 'Copy Link',
    linkCopied: 'Link copied!',
    shareMessage: "🎉 Today's coffee buyer: {winner}!\nDecided fairly with Coffee Roulette",

    // Tutorial
    tutorialTitle: 'Welcome! 👋',
    tutorialMessage: 'Enter a name and click + to add participants!',
    tutorialDismiss: 'Got it',
  },
} as const;

type TranslationKey = keyof typeof translations.ko;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const LANGUAGE_KEY = 'coffee-roulette-language';

// 브라우저/기기 언어 감지
const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'ko';
  // ko, ko-KR 등 한국어면 'ko', 그 외는 'en'
  return browserLang.startsWith('ko') ? 'ko' : 'en';
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ko');

  useEffect(() => {
    const savedLang = localStorage.getItem(LANGUAGE_KEY) as Language;
    if (savedLang && (savedLang === 'ko' || savedLang === 'en')) {
      // 저장된 언어 설정이 있으면 사용
      setLanguageState(savedLang);
    } else {
      // 없으면 브라우저 언어 감지
      setLanguageState(detectBrowserLanguage());
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
