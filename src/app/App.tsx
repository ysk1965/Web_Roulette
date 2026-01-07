import { useState } from 'react';
import { RouletteWheel } from './components/RouletteWheel';
import { ParticipantList } from './components/ParticipantList';
import { GroupManager, ParticipantGroup } from './components/GroupManager';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Input } from './components/ui/input';
import { Coffee, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog';

const STORAGE_KEY = 'coffee-roulette-groups';

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
    // 일치하는 그룹이 있으면 활성화, 없으면 해제
    setActiveGroupId(findMatchingGroup(newParticipants));
  };

  const handleRemoveParticipant = (index: number) => {
    const newParticipants = participants.filter((_, i) => i !== index);
    setParticipants(newParticipants);
    // 일치하는 그룹이 있으면 활성화, 없으면 해제
    setActiveGroupId(findMatchingGroup(newParticipants));
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

    // 활성 그룹이 있으면 통계 업데이트
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
          return {
            ...group,
            stats: newStats,
          };
        }
        return group;
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGroups));

      // GroupManager를 다시 렌더링하기 위해 강제로 업데이트
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Failed to update group stats:', error);
    }
  };

  // 새 그룹 저장 및 현재 당첨자 기록
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
      stats: { [winner]: 1 }, // 현재 당첨자 기록 포함
    };

    const savedGroups = localStorage.getItem(STORAGE_KEY);
    const groups: ParticipantGroup[] = savedGroups ? JSON.parse(savedGroups) : [];
    const updatedGroups = [...groups, newGroup];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGroups));

    // 새 그룹을 활성화
    setActiveGroupId(newGroupId);
    setShowSavePrompt(false);
    setNewGroupName('');

    // GroupManager 업데이트
    window.dispatchEvent(new Event('storage'));
  };

  const handleCloseWinnerDialog = () => {
    setShowWinnerDialog(false);
    setShowSavePrompt(false);
    setNewGroupName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Coffee className="w-12 h-12 text-amber-600" />
            <h1 className="text-5xl font-bold text-gray-800">커피 룰렛</h1>
          </div>
          <p className="text-gray-600 text-lg">
            오늘 누가 커피를 쏠까요? 룰렛을 돌려보세요!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* 룰렛 섹션 */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8 bg-white/80 backdrop-blur">
              <div className="flex flex-col items-center gap-6">
                <RouletteWheel
                  participants={participants}
                  isSpinning={isSpinning}
                  onSpinComplete={handleSpinComplete}
                />

                <Button
                  onClick={handleSpin}
                  disabled={isSpinning || participants.length < 2}
                  size="lg"
                  className="w-full max-w-xs text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  {isSpinning ? '돌아가는 중...' : '룰렛 돌리기 🎲'}
                </Button>
              </div>
            </Card>

            {/* 사용 방법 */}
            <Card className="p-6 bg-white/60 backdrop-blur">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">사용 방법</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>오른쪽 패널에서 참가자 이름을 추가하세요 (최소 2명)</li>
                <li>자주 사용하는 그룹은 저장해두고 불러올 수 있습니다</li>
                <li>"룰렛 돌리기" 버튼을 클릭하세요</li>
                <li>룰렛이 돌아가고 당첨자가 결정됩니다</li>
                <li>당첨된 사람이 커피를 사주면 됩니다! ☕</li>
                <li>저장된 그룹을 사용하면 누가 몇 번 당첨되었는지 자동으로 기록됩니다</li>
              </ol>
            </Card>
          </div>

          {/* 우측 사이드바 */}
          <div className="space-y-6">
            {/* 참가자 목록 섹션 */}
            <Card className="p-6 bg-white/80 backdrop-blur">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                참가자 관리
              </h2>
              <ParticipantList
                participants={participants}
                onAdd={handleAddParticipant}
                onRemove={handleRemoveParticipant}
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-3xl text-center">
                🎉 당첨 축하합니다! 🎉
              </DialogTitle>
              <DialogDescription asChild>
                <div className="text-center text-xl pt-4">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-8 px-6 rounded-lg shadow-lg mb-4">
                    <p className="text-4xl font-bold mb-2">{winner}</p>
                    <p className="text-lg">님이 커피를 쏩니다!</p>
                  </div>
                  <p className="text-gray-600">☕ 맛있는 커피 한 잔 부탁드립니다 ☕</p>

                  {/* 그룹 미연동 시 저장 유도 */}
                  {!activeGroupId && !showSavePrompt && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-800 mb-2">
                        이 결과를 기록하시겠어요?
                      </p>
                      <Button
                        onClick={() => setShowSavePrompt(true)}
                        variant="outline"
                        size="sm"
                        className="border-amber-400 text-amber-700 hover:bg-amber-100"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        그룹으로 저장하고 기록하기
                      </Button>
                    </div>
                  )}

                  {/* 그룹 저장 폼 */}
                  {!activeGroupId && showSavePrompt && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 text-left">
                      <p className="text-sm text-gray-700 mb-2">
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
                          className="text-base"
                        />
                        <Button onClick={saveNewGroupWithWinner} size="sm">
                          저장
                        </Button>
                      </div>
                      <Button
                        onClick={() => setShowSavePrompt(false)}
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-gray-500"
                      >
                        취소
                      </Button>
                    </div>
                  )}

                  {/* 그룹 연동됨 - 당첨 기록 표시 */}
                  {activeGroupId && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200 text-left">
                      <p className="text-sm text-green-700 mb-2 text-center">
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
                          <div className="mt-2 pt-2 border-t border-green-200">
                            <p className="text-xs text-gray-600 mb-2 text-center font-semibold">
                              📊 {activeGroup.name} 당첨 기록 (총 {totalWins}회)
                            </p>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {sortedStats.map(([name, count]) => (
                                <span
                                  key={name}
                                  className={`text-xs px-2 py-1 rounded ${
                                    name === winner
                                      ? 'bg-orange-200 text-orange-800 font-bold'
                                      : 'bg-white text-gray-700 border border-gray-200'
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