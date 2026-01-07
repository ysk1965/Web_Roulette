import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface RouletteWheelProps {
  participants: string[];
  isSpinning: boolean;
  onSpinComplete: (winner: string) => void;
}

export function RouletteWheel({ participants, isSpinning, onSpinComplete }: RouletteWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
  ];

  useEffect(() => {
    if (isSpinning && participants.length > 0) {
      // 랜덤하게 당첨자 선택
      const winnerIndex = Math.floor(Math.random() * participants.length);
      setSelectedIndex(winnerIndex);

      // 5바퀴 이상 돌고 당첨자 위치에서 멈추기
      const spins = 5 + Math.random() * 3; // 5~8바퀴
      const degreePerSegment = 360 / participants.length;
      
      // 화살표는 12시 방향(위)에 고정되어 있음
      // winnerIndex 세그먼트의 중앙이 화살표 아래(12시)에 오도록 회전
      // 세그먼트는 -90도(9시)부터 시작하므로, 12시는 0도
      const winnerAngle = winnerIndex * degreePerSegment + (degreePerSegment / 2);
      const targetRotation = spins * 360 - winnerAngle;
      
      setRotation(targetRotation);

      // 애니메이션 완료 후 당첨자 알림 및 confetti 효과
      setTimeout(() => {
        // Confetti 효과 발동
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        function randomInRange(min: number, max: number) {
          return Math.random() * (max - min) + min;
        }

        const interval: any = setInterval(function() {
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

        onSpinComplete(participants[winnerIndex]);
      }, 4000);
    }
  }, [isSpinning, participants, onSpinComplete]);

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
          duration: 4,
          ease: [0.17, 0.67, 0.16, 0.99],
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