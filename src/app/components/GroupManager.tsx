import { useState, useEffect } from 'react';
import { Save, Trash2, Users, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

export interface ParticipantGroup {
  id: string;
  name: string;
  participants: string[];
  createdAt: number;
  stats?: { [participantName: string]: number }; // 각 참가자별 당첨 횟수
}

interface GroupManagerProps {
  currentParticipants: string[];
  onLoadGroup: (participants: string[], groupId: string) => void;
  activeGroupId: string | null;
}

const STORAGE_KEY = 'coffee-roulette-groups';

export function GroupManager({ currentParticipants, onLoadGroup, activeGroupId }: GroupManagerProps) {
  const [groups, setGroups] = useState<ParticipantGroup[]>([]);
  const [groupName, setGroupName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  // localStorage에서 그룹 불러오기
  useEffect(() => {
    const loadGroups = () => {
      const savedGroups = localStorage.getItem(STORAGE_KEY);
      if (savedGroups) {
        try {
          setGroups(JSON.parse(savedGroups));
        } catch (error) {
          console.error('Failed to load groups:', error);
        }
      }
    };

    loadGroups();

    // storage 이벤트 리스너 추가 (다른 탭이나 컴포넌트에서 업데이트 감지)
    window.addEventListener('storage', loadGroups);
    
    return () => {
      window.removeEventListener('storage', loadGroups);
    };
  }, []);

  // 그룹 저장
  const saveGroup = () => {
    if (!groupName.trim()) {
      alert('그룹 이름을 입력해주세요!');
      return;
    }

    if (currentParticipants.length === 0) {
      alert('저장할 참가자가 없습니다!');
      return;
    }

    const newGroup: ParticipantGroup = {
      id: Date.now().toString(),
      name: groupName.trim(),
      participants: [...currentParticipants],
      createdAt: Date.now(),
      stats: {}, // 초기 통계는 빈 객체
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGroups));

    setGroupName('');
    setShowSaveForm(false);
  };

  // 그룹 삭제
  const deleteGroup = (id: string) => {
    if (confirm('이 그룹을 삭제하시겠습니까?')) {
      const updatedGroups = groups.filter((g) => g.id !== id);
      setGroups(updatedGroups);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGroups));
    }
  };

  // 그룹 불러오기
  const loadGroup = (group: ParticipantGroup) => {
    onLoadGroup(group.participants, group.id);
  };

  // 총 당첨 횟수 계산
  const getTotalWins = (stats?: { [key: string]: number }) => {
    if (!stats) return 0;
    return Object.values(stats).reduce((sum, count) => sum + count, 0);
  };

  return (
    <Card className="p-6 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6" />
          저장된 그룹
        </h2>
        <Button
          onClick={() => setShowSaveForm(!showSaveForm)}
          variant="outline"
          size="sm"
          disabled={currentParticipants.length === 0}
        >
          <Save className="w-4 h-4 mr-2" />
          현재 그룹 저장
        </Button>
      </div>

      {/* 그룹 저장 폼 */}
      {showSaveForm && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600 mb-2">
            현재 참가자 {currentParticipants.length}명을 저장합니다
          </p>
          <div className="flex gap-2">
            <Input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="그룹 이름 (예: 개발팀, 디자인팀)"
              onKeyDown={(e) => e.key === 'Enter' && saveGroup()}
            />
            <Button onClick={saveGroup} size="sm">
              저장
            </Button>
            <Button
              onClick={() => {
                setShowSaveForm(false);
                setGroupName('');
              }}
              variant="outline"
              size="sm"
            >
              취소
            </Button>
          </div>
        </div>
      )}

      {/* 저장된 그룹 목록 */}
      <div className="space-y-2">
        {groups.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>저장된 그룹이 없습니다</p>
            <p className="text-sm mt-1">참가자를 추가하고 그룹을 저장해보세요</p>
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className={`flex items-center justify-between rounded-lg px-4 py-3 border-2 transition-all ${
                activeGroupId === group.id
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-400'
                  : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800">{group.name}</h3>
                  {activeGroupId === group.id && (
                    <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                      활성
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {group.participants.length}명 · {group.participants.join(', ')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(group.createdAt).toLocaleDateString('ko-KR')} · 총 {getTotalWins(group.stats)}회 진행
                </p>
                {group.stats && Object.keys(group.stats).length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    <p className="font-semibold mb-1">당첨 기록:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(group.stats)
                        .sort(([, a], [, b]) => b - a)
                        .map(([name, count]) => (
                          <span
                            key={name}
                            className="bg-white px-2 py-1 rounded border border-purple-200"
                          >
                            {name}: {count}회
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => loadGroup(group)}
                  variant="outline"
                  size="sm"
                  className="bg-white"
                >
                  <Download className="w-4 h-4 mr-1" />
                  불러오기
                </Button>
                <Button
                  onClick={() => deleteGroup(group.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {groups.length > 0 && (
        <p className="text-sm text-gray-500 mt-4 text-center">
          총 {groups.length}개 그룹 저장됨
        </p>
      )}
    </Card>
  );
}