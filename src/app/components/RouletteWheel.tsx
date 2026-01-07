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
  const isSpinningRef = useRef(false);
  const onSpinCompleteRef = useRef(onSpinComplete);

  // 항상 최신 콜백 참조 유지
  useEffect(() => {
    onSpinCompleteRef.current = onSpinComplete;
  }, [onSpinComplete]);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
  ];

  // 애니메이션 설정
  const SPIN_DURATION = 6; // 총 스핀 시간 (초)
  const TOTAL_SPINS = 7; // 총 회전 수

  useEffect(() => {
    // 이미 스핀 중이면 중복 실행 방지
    if (isSpinning && participants.length > 0 && !isSpinningRef.current) {
      isSpinningRef.current = true;

      // 1. 먼저 당첨자 결정 (스핀 시작 전에 확정)
      const winnerIndex = Math.floor(Math.random() * participants.length);
      const winner = participants[winnerIndex];

      // 2. 당첨자 위치 계산 (세그먼트 내 랜덤 위치)
      const degreePerSegment = 360 / participants.length;
      // 세그먼트 경계에서 20% 안쪽 범위 내에서 랜덤하게 위치 선정
      // 너무 가장자리면 애매해 보이므로 20%~80% 범위 사용
      const minOffset = degreePerSegment * 0.2;
      const maxOffset = degreePerSegment * 0.8;
      const randomOffset = minOffset + Math.random() * (maxOffset - minOffset);
      const winnerAngle = winnerIndex * degreePerSegment + randomOffset;

      // 3. 현재 회전 상태를 고려하여 목표 회전값 계산
      const currentNormalized = ((rotation % 360) + 360) % 360;
      const targetNormalized = (360 - winnerAngle + 360) % 360;
      const angleDiff = ((targetNormalized - currentNormalized) + 360) % 360;

      // 7바퀴 + 당첨자 위치까지 회전
      const targetRotation = rotation + TOTAL_SPINS * 360 + angleDiff;

      setRotation(targetRotation);

      // 4. 애니메이션 완료 후 당첨자 알림 및 confetti 효과
      setTimeout(() => {
        // Confetti 효과 발동
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

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

        isSpinningRef.current = false;
        onSpinCompleteRef.current(winner);
      }, SPIN_DURATION * 1000);
    }

    // isSpinning이 false가 되면 ref 초기화
    if (!isSpinning) {
      isSpinningRef.current = false;
    }
  }, [isSpinning, participants]);

  if (participants.length === 0) {
    return (
      <div className="flex items-center justify-center w-80 h-80 rounded-full bg-gray-100 border-4 border-gray-300">
        <p className="text-gray-400 text-center px-8">참가자를 추가해주세요</p>
      </div>
    );
  }

  const segmentAngle = 360 / participants.length;

  return (
    <div className="relative">
      {/* 화살표 (위쪽 중앙) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10">
        <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-red-500 drop-shadow-lg" />
      </div>

      {/* 룰렛 휠 */}
      <motion.div
        className="relative w-80 h-80 rounded-full overflow-hidden border-8 border-white shadow-2xl"
        animate={{ rotate: rotation }}
        transition={{
          duration: SPIN_DURATION,
          // 초반에 매우 빠르게 시작해서 점점 느려지는 이징
          // cubic-bezier(0, 0.7, 0.1, 1) - 급격한 시작, 부드러운 감속
          ease: [0, 0.7, 0.1, 1],
        }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {participants.map((participant, index) => {
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center shadow-lg">
          <span className="text-2xl">☕</span>
        </div>
      </motion.div>
    </div>
  );
}