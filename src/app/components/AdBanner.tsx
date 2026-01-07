import { useEffect, useRef } from 'react';

export type AdPosition = 'top' | 'bottom' | 'sidebar';
export type AdSize = 'banner' | 'rectangle' | 'leaderboard';

interface AdBannerProps {
  position?: AdPosition;
  size?: AdSize;
  className?: string;
  // Google AdSense
  adClient?: string;
  adSlot?: string;
  // Kakao AdFit
  adUnit?: string;
  // 테스트 모드 (개발 중 플레이스홀더 표시)
  testMode?: boolean;
}

// 광고 크기 설정
const AD_SIZES = {
  banner: {
    width: 320,
    height: 50,
    label: '모바일 배너',
  },
  rectangle: {
    width: 300,
    height: 250,
    label: '직사각형',
  },
  leaderboard: {
    width: 728,
    height: 90,
    label: '리더보드',
  },
};

export function AdBanner({
  position = 'bottom',
  size = 'banner',
  className = '',
  adClient,
  adSlot,
  adUnit,
  testMode = true, // 기본값은 테스트 모드
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const adSize = AD_SIZES[size];

  useEffect(() => {
    // 테스트 모드면 실제 광고 로드 안 함
    if (testMode) return;

    // Google AdSense 로드
    if (adClient && adSlot) {
      try {
        // @ts-expect-error - AdSense global
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense 로드 실패:', error);
      }
    }

    // Kakao AdFit 로드
    if (adUnit && adRef.current) {
      const ins = document.createElement('ins');
      ins.className = 'kakao_ad_area';
      ins.style.display = 'none';
      ins.setAttribute('data-ad-unit', adUnit);
      ins.setAttribute('data-ad-width', adSize.width.toString());
      ins.setAttribute('data-ad-height', adSize.height.toString());
      adRef.current.appendChild(ins);

      // AdFit 스크립트 로드
      const script = document.createElement('script');
      script.async = true;
      script.src = '//t1.daumcdn.net/kas/static/ba.min.js';
      document.body.appendChild(script);
    }
  }, [adClient, adSlot, adUnit, testMode, adSize]);

  // 위치에 따른 스타일 (광고 없을 때 공간 최소화)
  const positionStyles: Record<AdPosition, string> = {
    top: 'w-full flex justify-center',
    bottom: 'w-full flex justify-center py-2',
    sidebar: 'w-full flex justify-center py-2',
  };

  return (
    <div
      ref={adRef}
      className={`${positionStyles[position]} ${className}`}
    >
      {/* 테스트 모드: 플레이스홀더 표시 */}
      {testMode && (
        <div
          className="flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 transition-colors"
          style={{
            width: size === 'leaderboard' ? '100%' : adSize.width,
            maxWidth: adSize.width,
            height: adSize.height,
          }}
        >
          <div className="text-center">
            <p className="text-gray-400 dark:text-gray-500 text-xs font-medium">
              광고 영역
            </p>
            <p className="text-gray-300 dark:text-gray-600 text-xs">
              {adSize.width} x {adSize.height}
            </p>
          </div>
        </div>
      )}

      {/* Google AdSense */}
      {!testMode && adClient && adSlot && (
        <ins
          className="adsbygoogle"
          style={{
            display: 'block',
            minHeight: '50px',
          }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
}

// 광고 관련 설정 가이드
export const AD_SETUP_GUIDE = {
  googleAdsense: {
    name: 'Google AdSense',
    steps: [
      '1. Google AdSense 계정 생성 (https://adsense.google.com)',
      '2. 사이트 등록 및 승인 받기',
      '3. 광고 단위 생성 후 ad-client와 ad-slot 값 복사',
      '4. index.html의 <head>에 AdSense 스크립트 추가:',
      '   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXX" crossorigin="anonymous"></script>',
      '5. AdBanner 컴포넌트에 adClient와 adSlot props 전달',
    ],
  },
  kakaoAdfit: {
    name: 'Kakao AdFit',
    steps: [
      '1. Kakao AdFit 가입 (https://adfit.kakao.com)',
      '2. 매체(사이트) 등록',
      '3. 광고 단위 생성 후 unit ID 복사',
      '4. AdBanner 컴포넌트에 adUnit prop 전달',
    ],
  },
};
