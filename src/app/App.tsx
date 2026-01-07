import { useState, useEffect } from 'react';
import { RouletteWheel } from './components/RouletteWheel';
import { ParticipantList } from './components/ParticipantList';
import { GroupManager, ParticipantGroup } from './components/GroupManager';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Input } from './components/ui/input';
import { Coffee, Save, Moon, Sun } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog';

const STORAGE_KEY = 'coffee-roulette-groups';
const THEME_KEY = 'coffee-roulette-theme';

// 두 배열이 같은 요소를 가지는지 확인 (순서 무관)
const arraysHaveSameElements = (arr1: string[], arr2: string[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((val, idx) => val === sorted2[idx]);
};

export default function App() {
  const [participants, setParticipants] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 다크 모드 초기화
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  // 다크 모드 토글
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem(THEME_KEY, newMode ? 'dark' : 'light');
  };

  // 참가자 목록과 일치하는 저장된 그룹 찾기
  const findMatchingGroup = (participantList: string[]): string | null => {
    const savedGroups = localStorage.getItem(STORAGE_KEY);
    if (!savedGroups || participantList.length === 0) return null;

    try {
      const groups: ParticipantGroup[] = JSON.parse(savedGroups);
      const matchingGroup = groups.find(group =>
        arraysHaveSameElements(group.participants, participantList)
      );
      return matchingGroup?.id || null;
    } catch {
      return null;
    }
  };

  const handleAddParticipant = (name: string) => {
    const newParticipants = [...participants, name];
    setParticipants(newParticipants);
    setActiveGroupId(findMatchingGroup(newParticipants));
  };

  const handleRemoveParticipant = (index: number) => {
    const newParticipants = participants.filter((_, i) => i !== index);
    setParticipants(newParticipants);
    setActiveGroupId(findMatchingGroup(newParticipants));
  };

  const handleReorderParticipants = (newParticipants: string[]) => {
    setParticipants(newParticipants);
    // 순서 변경은 그룹 활성 상태 유지 (멤버 구성은 동일하므로)
  };

  const handleLoadGroup = (groupParticipants: string[], groupId: string) => {
    setParticipants(groupParticipants);
    setActiveGroupId(groupId);
    setWinner(null);
  };

  const handleSpin = () => {
    if (participants.length < 2) {
      alert('최소 2명 이상의 참가자가 필요합니다!');
      return;
    }
    setIsSpinning(true);
    setWinner(null);
    setShowWinnerDialog(false);
  };

  const handleSpinComplete = (winnerName: string) => {
    setIsSpinning(false);
    setWinner(winnerName);
    setShowWinnerDialog(true);

    if (activeGroupId) {
      updateGroupStats(activeGroupId, winnerName);
    }
  };

  const updateGroupStats = (groupId: string, winnerName: string) => {
    const savedGroups = localStorage.getItem(STORAGE_KEY);
    if (!savedGroups) return;

    try {
      const groups: ParticipantGroup[] = JSON.parse(savedGroups);
      const updatedGroups = groups.map((group) => {
        if (group.id === groupId) {
          const newStats = { ...group.stats };
          newStats[winnerName] = (newStats[winnerName] || 0) + 1;
          return { ...group, stats: newStats };
        }
        return group;
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGroups));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Failed to update group stats:', error);
    }
  };

  const saveNewGroupWithWinner = () => {
    if (!newGroupName.trim()) {
      alert('그룹 이름을 입력해주세요!');
      return;
    }

    if (!winner) return;

    const newGroupId = Date.now().toString();
    const newGroup: ParticipantGroup = {
      id: newGroupId,
      name: newGroupName.trim(),
      participants: [...participants],
      createdAt: Date.now(),
      stats: { [winner]: 1 },
    };

    const savedGroups = localStorage.getItem(STORAGE_KEY);
    const groups: ParticipantGroup[] = savedGroups ? JSON.parse(savedGroups) : [];
    const updatedGroups = [...groups, newGroup];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGroups));
    setActiveGroupId(newGroupId);
    setShowSavePrompt(false);
    setNewGroupName('');
    window.dispatchEvent(new Event('storage'));
  };

  const handleCloseWinnerDialog = () => {
    setShowWinnerDialog(false);
    setShowSavePrompt(false);
    setNewGroupName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 sm:py-12 px-3 sm:px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-6 sm:mb-12">
          {/* 다크모드 토글 */}
          <div className="flex justify-end mb-4">
            <Button
              onClick={toggleDarkMode}
              variant="outline"
              size="icon"
              className="rounded-full bg-white/80 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <Coffee className="w-8 h-8 sm:w-12 sm:h-12 text-amber-600 dark:text-amber-400" />
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-800 dark:text-gray-100">커피 룰렛</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            오늘 누가 커피를 쏠까요? 룰렛을 돌려보세요!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 items-start">
          {/* 룰렛 섹션 */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8 order-1 lg:order-1">
            <Card className="p-4 sm:p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 dark:border dark:border-gray-700">
              <div className="flex flex-col items-center gap-4 sm:gap-6">
                <RouletteWheel
                  participants={participants}
                  isSpinning={isSpinning}
                  onSpinComplete={handleSpinComplete}
                />

                <Button
                  onClick={handleSpin}
                  disabled={isSpinning || participants.length < 2}
                  size="lg"
                  className="w-full max-w-xs text-base sm:text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 dark:from-amber-600 dark:to-orange-600"
                >
                  {isSpinning ? '돌아가는 중...' : '룰렛 돌리기 🎲'}
                </Button>
              </div>
            </Card>

            {/* 사용 방법 */}
            <Card className="p-4 sm:p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur border-0 dark:border dark:border-gray-700 order-3 lg:order-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">사용 방법</h3>
              <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <li>참가자 이름을 추가하세요 (최소 2명)</li>
                <li>자주 사용하는 그룹은 저장해두고 불러올 수 있습니다</li>
                <li>"룰렛 돌리기" 버튼을 클릭하세요</li>
                <li>룰렛이 돌아가고 당첨자가 결정됩니다</li>
                <li>당첨된 사람이 커피를 사주면 됩니다! ☕</li>
                <li>저장된 그룹을 사용하면 당첨 기록이 자동 저장됩니다</li>
              </ol>
            </Card>
          </div>

          {/* 우측 사이드바 */}
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-2">
            {/* 참가자 목록 섹션 */}
            <Card className="p-4 sm:p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 dark:border dark:border-gray-700">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6 text-center">
                참가자 관리
              </h2>
              <ParticipantList
                participants={participants}
                onAdd={handleAddParticipant}
                onRemove={handleRemoveParticipant}
                onReorder={handleReorderParticipants}
                isSpinning={isSpinning}
              />
            </Card>

            {/* 그룹 관리 섹션 */}
            <GroupManager
              currentParticipants={participants}
              onLoadGroup={handleLoadGroup}
              activeGroupId={activeGroupId}
            />
          </div>
        </div>

        {/* 당첨자 팝업 */}
        <Dialog open={showWinnerDialog} onOpenChange={handleCloseWinnerDialog}>
          <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md rounded-xl dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-2xl sm:text-3xl text-center dark:text-gray-100">
                🎉 당첨 축하합니다! 🎉
              </DialogTitle>
              <DialogDescription asChild>
                <div className="text-center text-lg sm:text-xl pt-4">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 dark:from-yellow-500 dark:to-orange-500 text-white py-6 sm:py-8 px-4 sm:px-6 rounded-lg shadow-lg mb-4">
                    <p className="text-3xl sm:text-4xl font-bold mb-2">{winner}</p>
                    <p className="text-base sm:text-lg">님이 커피를 쏩니다!</p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">☕ 맛있는 커피 한 잔 부탁드립니다 ☕</p>

                  {/* 그룹 미연동 시 저장 유도 */}
                  {!activeGroupId && !showSavePrompt && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                        이 결과를 기록하시겠어요?
                      </p>
                      <Button
                        onClick={() => setShowSavePrompt(true)}
                        variant="outline"
                        size="sm"
                        className="border-amber-400 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        그룹으로 저장하고 기록하기
                      </Button>
                    </div>
                  )}

                  {/* 그룹 저장 폼 */}
                  {!activeGroupId && showSavePrompt && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 text-left">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        현재 참가자 {participants.length}명을 그룹으로 저장하고
                        <br />이 결과를 기록합니다.
                      </p>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          placeholder="그룹 이름 (예: 개발팀)"
                          onKeyDown={(e) => e.key === 'Enter' && saveNewGroupWithWinner()}
                          className="text-base dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                        <Button onClick={saveNewGroupWithWinner} size="sm">
                          저장
                        </Button>
                      </div>
                      <Button
                        onClick={() => setShowSavePrompt(false)}
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-gray-500 dark:text-gray-400"
                      >
                        취소
                      </Button>
                    </div>
                  )}

                  {/* 그룹 연동됨 - 당첨 기록 표시 */}
                  {activeGroupId && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 text-left">
                      <p className="text-sm text-green-700 dark:text-green-300 mb-2 text-center">
                        ✓ 결과가 그룹에 자동으로 기록되었습니다
                      </p>
                      {(() => {
                        const savedGroups = localStorage.getItem(STORAGE_KEY);
                        if (!savedGroups) return null;
                        const groups: ParticipantGroup[] = JSON.parse(savedGroups);
                        const activeGroup = groups.find(g => g.id === activeGroupId);
                        if (!activeGroup?.stats || Object.keys(activeGroup.stats).length === 0) return null;

                        const sortedStats = Object.entries(activeGroup.stats)
                          .sort(([, a], [, b]) => b - a);
                        const totalWins = sortedStats.reduce((sum, [, count]) => sum + count, 0);

                        return (
                          <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 text-center font-semibold">
                              📊 {activeGroup.name} 당첨 기록 (총 {totalWins}회)
                            </p>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {sortedStats.map(([name, count]) => (
                                <span
                                  key={name}
                                  className={`text-xs px-2 py-1 rounded ${
                                    name === winner
                                      ? 'bg-orange-200 dark:bg-orange-700 text-orange-800 dark:text-orange-100 font-bold'
                                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                                  }`}
                                >
                                  {name}: {count}회
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>
            <Button
              onClick={handleCloseWinnerDialog}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              확인
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
