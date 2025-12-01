import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EntryPage: React.FC = () => {
  const navigate = useNavigate();
  const [isButtonPressed, setIsButtonPressed] = useState<boolean>(false);

  const handleStartClick = () => {
    setIsButtonPressed(true);
    // 버튼 클릭 애니메이션 후 로그인 페이지로 이동
    setTimeout(() => {
      navigate('/login');
    }, 300);
  };

  const handleButtonDown = () => {
    setIsButtonPressed(true);
  };

  const handleButtonUp = () => {
    setIsButtonPressed(false);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 배경 이미지 */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/entry-page_bg.jpg')",
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      />

      {/* 어두운 오버레이 (선택사항) */}
      <div className="absolute inset-0 bg-black opacity-0" />

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {/* 타이틀 */}
        <div className="mb-16 md:mb-24 animate-bounce" style={{ animationDuration: '2s' }}>
          <img
            src="/assets/title.jpg"
            alt="오여봐요 코딩의 숲"
            className="w-64 md:w-96 h-auto drop-shadow-2xl"
          />
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={handleStartClick}
          onMouseDown={handleButtonDown}
          onMouseUp={handleButtonUp}
          onTouchStart={handleButtonDown}
          onTouchEnd={handleButtonUp}
          className="relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform duration-100"
          style={{
            transform: isButtonPressed ? 'scale(0.95)' : 'scale(1)',
            filter: isButtonPressed ? 'brightness(0.9)' : 'brightness(1)'
          }}
        >
          <img
            src={isButtonPressed ? '/assets/start_btn_click.jpg' : '/assets/start_btn.jpg'}
            alt="시작하기"
            className="w-56 md:w-80 h-auto drop-shadow-2xl cursor-pointer hover:drop-shadow-lg transition-all duration-100"
          />
        </button>

        {/* 하단 텍스트 (선택사항) */}
        <div className="absolute bottom-8 text-center">
          <p className="text-white text-sm md:text-base font-semibold drop-shadow-lg">
            클릭하여 시작하세요
          </p>
        </div>
      </div>
    </div>
  );
};

export default EntryPage;
