import React, { useState, useEffect, useRef } from 'react';

const LoginPage: React.FC = () => {
  // ============ STATE 관리 ============
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orvileMessageIndex, setOrvileMessageIndex] = useState<number>(0);
  const [bgmStarted, setBgmStarted] = useState<boolean>(false);

  // ============ REF 관리 (오디오 제어) ============
  const bgmAudioRef = useRef<HTMLAudioElement>(null);
  const sfxTypingRef = useRef<HTMLAudioElement>(null);
  const sfxClickRef = useRef<HTMLAudioElement>(null);
  const lastTypingSoundTime = useRef<number>(0);

  // ============ EFFECT: 첫 상호작용 시 BGM 재생 ============
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (bgmAudioRef.current && !bgmStarted) {
        bgmAudioRef.current.play().catch(err => {
          console.log('BGM 자동재생 차단됨:', err);
        });
        setBgmStarted(true);
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [bgmStarted]);

  // ============ EFFECT: 로드리 메시지 순차 표시 ============
  useEffect(() => {
    if (orvileMessageIndex < orvileMessages.length - 1) {
      const timer = setTimeout(() => {
        setOrvileMessageIndex(prev => prev + 1);
      }, 4000); // 4초마다 메시지 변경

      return () => clearTimeout(timer);
    }
  }, [orvileMessageIndex]);

  // ============ HANDLER: 타이핑 효과음 + 쓰로틀링 ============
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (fieldName === 'username') {
      setUsername(e.target.value);
    } else {
      setPassword(e.target.value);
    }

    // 타이핑 효과음 재생 (쓰로틀링: 100ms 이상 떨어져야만 재생)
    const now = Date.now();
    if (now - lastTypingSoundTime.current > 100) {
      if (sfxTypingRef.current) {
        sfxTypingRef.current.currentTime = 0;
        sfxTypingRef.current.play().catch(() => {});
      }
      lastTypingSoundTime.current = now;
    }
  };

  // ============ HANDLER: 로그인 버튼 클릭 ============
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // 클릭 효과음 재생
    if (sfxClickRef.current) {
      sfxClickRef.current.currentTime = 0;
      sfxClickRef.current.play().catch(() => {});
    }

    if (!username.trim() || !password.trim()) {
      alert('사용자명과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 백엔드 API 호출
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        // 로그인 성공 → 토큰 저장 및 스토리 페이지로 이동
        localStorage.setItem('authToken', data.token);
        window.location.href = '/story';
      } else {
        alert('로그인 실패. 다시 시도해주세요.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      alert('네트워크 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  // ============ 로드리 메시지 배열 ============
  const orvileMessages = [
    '어서오세요! 다음 행선지는?',
    '뭐야, 짐이 많네.',
    '자, 탑승권을 준비하고 있어.',
  ];

  // ============ RETURN: JSX 렌더링 ============
  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden">

      {/* ========== [LAYER 0] 배경 이미지 ========== */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%)",
        }}
      >
        {/* 배경이 없을 때는 그라데이션으로 표시 */}
      </div>

      {/* ========== 메인 콘텐츠 래퍼 ========== */}
      <div className="relative z-10 flex items-center justify-center gap-20 max-w-7xl px-4 md:gap-12">

        {/* ========== [LAYER 2] NPC 로드리 ========== */}
        <div className="hidden lg:flex flex-col items-center gap-6 relative z-20">
          {/* 로드리 캐릭터 (CSS 기반) */}
          <div className="w-64 h-72 flex flex-col items-center justify-center animate-[npc-breathe_3s_ease-in-out_infinite] transition-transform">
            {/* 로드리 머리 */}
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-full border-4 border-yellow-700 relative shadow-lg mb-2">
              {/* 눈 */}
              <div className="absolute top-6 left-6 w-3 h-4 bg-gray-900 rounded-full">
                <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full"></div>
              </div>
              <div className="absolute top-6 right-6 w-3 h-4 bg-gray-900 rounded-full">
                <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full"></div>
              </div>
              {/* 입 */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-5 h-3 border-b-2 border-gray-900 rounded-b-2xl"></div>
            </div>

            {/* 로드리 몸 */}
            <div className="w-20 h-20 bg-gradient-to-b from-blue-400 to-blue-500 rounded-2xl border-2 border-yellow-700 flex items-center justify-between px-2 relative">
              {/* 왼쪽 팔 */}
              <div className="w-3 h-4 bg-yellow-100 rounded-full border border-yellow-700 transform -rotate-12"></div>
              {/* 오른쪽 팔 */}
              <div className="w-3 h-4 bg-yellow-100 rounded-full border border-yellow-700 transform rotate-12"></div>
            </div>
          </div>

          {/* 로드리 대화창 */}
          <div className="bg-white border-4 border-yellow-700 rounded-3xl px-6 py-4 max-w-xs shadow-lg transform -rotate-1 transition-all duration-500">
            <p className="text-yellow-700 font-bold text-center text-sm leading-relaxed h-12 flex items-center justify-center">
              {orvileMessages[orvileMessageIndex % orvileMessages.length]}
            </p>
          </div>
        </div>

        {/* ========== [LAYER 3] 로그인 폼 (여권/탑승권 스타일) ========== */}
        <div className="bg-gradient-to-br from-blue-800 to-blue-900 border-6 border-yellow-400 rounded-4xl p-6 sm:p-8 md:p-10 shadow-2xl relative z-30 transform -rotate-1 hover:-rotate-0 transition-all duration-300 w-full max-w-sm md:max-w-md">

          {/* 카드 헤더 */}
          <div className="text-center mb-8">
            <div className="inline-block bg-yellow-400 border-2 border-blue-800 rounded px-3 py-2 mb-4 shadow-lg">
              <span className="text-blue-800 font-black text-lg">DAL</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-yellow-300 mb-2 tracking-wider">
              DAL AIRWAYS
            </h1>
            <p className="text-yellow-300 text-xs md:text-sm font-bold tracking-widest">
              BOARDING PASS
            </p>
          </div>

          {/* 폼 구분선 */}
          <hr className="border-yellow-400 border-t-2 my-6" />

          {/* 로그인 폼 */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* 아이디 입력 필드 */}
            <div>
              <label className="block text-yellow-300 text-xs md:text-sm font-bold mb-2 uppercase tracking-wider">
                Passenger Name
              </label>
              <div className="flex items-center bg-blue-600 rounded-full border-2 border-blue-400 focus-within:border-yellow-400 focus-within:shadow-lg focus-within:shadow-yellow-400/30 transition-all duration-200 px-4 py-0.5">
                <span className="text-white text-lg mr-3">👤</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleTyping(e, 'username')}
                  placeholder="아이디"
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-white outline-none py-3 placeholder-gray-300 text-sm md:text-base"
                />
              </div>
            </div>

            {/* 비밀번호 입력 필드 */}
            <div>
              <label className="block text-yellow-300 text-xs md:text-sm font-bold mb-2 uppercase tracking-wider">
                Ticket Number
              </label>
              <div className="flex items-center bg-blue-600 rounded-full border-2 border-blue-400 focus-within:border-yellow-400 focus-within:shadow-lg focus-within:shadow-yellow-400/30 transition-all duration-200 px-4 py-0.5">
                <span className="text-white text-lg mr-3">🎫</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => handleTyping(e, 'password')}
                  placeholder="비밀번호"
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-white outline-none py-3 placeholder-gray-300 text-sm md:text-base"
                />
              </div>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim()}
              className={`
                w-full py-4 bg-yellow-400 text-blue-800 font-black text-base md:text-lg rounded-full uppercase
                shadow-[0_6px_0_#b45309] hover:shadow-[0_2px_0_#b45309] hover:translate-y-1
                active:shadow-none active:translate-y-2
                transition-all duration-100 disabled:opacity-60 disabled:cursor-not-allowed
                ${isLoading ? 'animate-pulse' : ''}
              `}
            >
              {isLoading ? '탑승 준비 중...' : '🚁 출발하기'}
            </button>
          </form>

          {/* 카드 하단 */}
          <div className="mt-8 pt-6 border-t border-white border-opacity-20 text-center">
            <p className="text-white text-xs md:text-sm">
              계정이 없으신가요?{' '}
              <a href="#" className="text-yellow-300 font-bold hover:underline transition-colors">
                회원가입
              </a>
            </p>
          </div>

          {/* 저작권 표시 */}
          <div className="absolute bottom-2 right-3 text-white text-opacity-40 text-xs">
            <p>Nook Coding Platform</p>
          </div>
        </div>
      </div>

      {/* ========== 오디오 요소 (숨김) ========== */}
      <audio
        ref={bgmAudioRef}
        src="/assets/bgm_airport.mp3"
        loop
        crossOrigin="anonymous"
      />
      <audio
        ref={sfxTypingRef}
        src="/assets/sfx_typing.wav"
        crossOrigin="anonymous"
      />
      <audio
        ref={sfxClickRef}
        src="/assets/sfx_click_confirm.wav"
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default LoginPage;
