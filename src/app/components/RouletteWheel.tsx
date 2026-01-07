import { motion } from 'motion/react';
import { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';

interface RouletteWheelProps {
  participants: string[];
  isSpinning: boolean;
  onSpinComplete: (winner: string) => void;
}

export function RouletteWheel({ participants, isSpinning, onSpinComplete }: RouletteWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // 스핀 중 렌더링에 사용할 고정된 참가자 목록
  const [displayParticipants, setDisplayParticipants] = useState<string[]>([]);

  // 스핀 중복 실행 방지 및 당첨자 저장을 위한 ref
  const isSpinningRef = useRef(false);
  const winnerNameRef = useRef<string | null>(null);
  const onSpinCompleteRef = useRef(onSpinComplete);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // onSpinComplete 최신 값 유지
  useEffect(() => {
    onSpinCompleteRef.current = onSpinComplete;
  }, [onSpinComplete]);

  // 스핀 중이 아닐 때만 displayParticipants 업데이트
  useEffect(() => {
    if (!isSpinningRef.current) {
      setDisplayParticipants(participants);
    }
  }, [participants]);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
  ];

  useEffect(() => {
    // 스핀 시작: isSpinning이 true가 되고, 아직 스핀 중이 아닐 때만 실행
    if (isSpinning && !isSpinningRef.current && participants.length > 0) {
      isSpinningRef.current = true;

      // 스핀 시작 시점의 participants 스냅샷 고정 (렌더링에도 사용)
      const currentParticipants = [...participants];
      setDisplayParticipants(currentParticipants);

      // 랜덤하게 당첨자 선택 및 이름 저장
      const winnerIndex = Math.floor(Math.random() * currentParticipants.length);
      const winnerName = currentParticipants[winnerIndex];
      winnerNameRef.current = winnerName;
      setSelectedIndex(winnerIndex);

      // 5바퀴 이상 돌고 당첨자 위치에서 멈추기
      const spins = 7 + Math.floor(Math.random() * 2); // 8~9바퀴
      const degreePerSegment = 360 / currentParticipants.length;

      // 화살표는 12시 방향(위)에 고정되어 있음
      // winnerIndex 세그먼트 내 랜덤한 위치가 화살표 아래(12시)에 오도록 회전
      // 세그먼트는 -90도(12시)부터 시작함
      // 가장자리 20%는 피하고 중간 60% 범위에서 랜덤 선택
      const minOffset = degreePerSegment * 0.1;
      const maxOffset = degreePerSegment * 0.9;
      const randomOffset = minOffset + Math.random() * (maxOffset - minOffset);
      const winnerAngle = winnerIndex * degreePerSegment + randomOffset;

      // winnerIndex가 12시에 멈추는 정확한 위치 (mod 360)
      const stopAngle = ((360 - winnerAngle) % 360 + 360) % 360;

      // 현재 rotation에서 최소 spins바퀴 돌고 정확한 위치에 멈추도록 계산
      const minTarget = rotation + spins * 360;
      let targetRotation = Math.ceil((minTarget - stopAngle) / 360) * 360 + stopAngle;

      // 안전장치: targetRotation이 minTarget보다 작으면 한 바퀴 더
      if (targetRotation < minTarget) {
        targetRotation += 360;
      }

      setRotation(targetRotation);

      // 애니메이션 완료 후 당첨자 알림 및 confetti 효과
      timeoutRef.current = setTimeout(() => {
        // Confetti 효과 발동
        const duration = 5000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 25, spread: 360, ticks: 60, zIndex: 100 };

        function randomInRange(min: number, max: number) {
          return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);

          // 양쪽에서 confetti 발사
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
          });
        }, 250);

        // 저장해둔 당첨자 이름 사용 (클로저 문제 해결)
        if (winnerNameRef.current) {
          onSpinCompleteRef.current(winnerNameRef.current);
        }
      }, 8000);
    }

    // 스핀 종료: isSpinning이 false가 되면 ref 초기화 및 displayParticipants 동기화
    if (!isSpinning && isSpinningRef.current) {
      isSpinningRef.current = false;
      // 스핀이 끝나면 최신 participants로 동기화
      setDisplayParticipants(participants);
    }
  }, [isSpinning, participants, rotation]);

  // 렌더링에 사용할 참가자 목록 (스핀 중에는 고정된 목록 사용)
  const renderParticipants = displayParticipants.length > 0 ? displayParticipants : participants;

  if (renderParticipants.length === 0) {
    return (
      <div className="flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gray-100 dark:bg-gray-700 border-4 border-gray-300 dark:border-gray-600">
        <p className="text-gray-400 dark:text-gray-500 text-center px-8 text-sm sm:text-base">참가자를 추가해주세요</p>
      </div>
    );
  }

  const segmentAngle = 360 / renderParticipants.length;

  return (
    <div className="relative">
      {/* 화살표 (위쪽 중앙) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 sm:-translate-y-4 z-10">
        <div className="w-0 h-0 border-l-[15px] sm:border-l-[20px] border-l-transparent border-r-[15px] sm:border-r-[20px] border-r-transparent border-t-[22px] sm:border-t-[30px] border-t-red-500 drop-shadow-lg" />
      </div>

      {/* 룰렛 휠 */}
      <motion.div
        className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-6 sm:border-8 border-white dark:border-gray-600 shadow-2xl"
        animate={{ rotate: rotation }}
        transition={{
          duration: 8,
          ease: [0.08, 0.35, 0.01, 1],
        }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {renderParticipants.map((participant, index) => {
            const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
            const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
            const midAngle = (startAngle + endAngle) / 2;

            const x1 = 100 + 100 * Math.cos(startAngle);
            const y1 = 100 + 100 * Math.sin(startAngle);
            const x2 = 100 + 100 * Math.cos(endAngle);
            const y2 = 100 + 100 * Math.sin(endAngle);

            const textX = 100 + 65 * Math.cos(midAngle);
            const textY = 100 + 65 * Math.sin(midAngle);
            const textRotation = (midAngle * 180) / Math.PI + 90;

            const largeArcFlag = segmentAngle > 180 ? 1 : 0;

            return (
              <g key={index}>
                <path
                  d={`M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={colors[index % colors.length]}
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={textX}
                  y={textY}
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                >
                  {participant}
                </text>
              </g>
            );
          })}
        </svg>

        {/* 중앙 원 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-white dark:bg-gray-800 rounded-full border-3 sm:border-4 border-gray-300 dark:border-gray-600 flex items-center justify-center shadow-lg">
          <span className="text-xl sm:text-2xl">☕</span>
        </div>
      </motion.div>
    </div>
  );
}