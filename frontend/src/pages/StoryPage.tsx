import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IDEWindowManager from '../components/IDEWindowManager';

interface Scene {
  id: number;
  image: string;
  dialogues: string[];
  character: string;
  npcName: string;
}

const StoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState<number>(0);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [sceneStartTime, setSceneStartTime] = useState<number>(Date.now());

  // 스토리 데이터
  const scenes: Scene[] = [
    {
      id: 1,
      image: '/assets/img1.jpg',
      dialogues: [
        '어서 오시게, 주민 대표!',
        '우리 섬 생활은 좀 익숙해졌나?',
        '다름이 아니라, 우리 섬도 이제 최첨단 디지털 시대를 맞이해서',
        "'무인도 이주 플랜 관리 시스템'을 도입했거든!",
        '이름하여... **파이썬(Python)**이라네!'
      ],
      character: 'tom_nook',
      npcName: 'Tom Nook'
    },
    {
      id: 2,
      image: '/assets/img2.jpg',
      dialogues: [
        '자자, 겁먹을 것 없어!',
        '이건 그냥 아주 똑똑한 너굴포트라고 생각하면 돼.',
        '우리가 이 녀석한테 명령을 내리면,',
        '섬의 정보를 기억하거나 계산을 대신 해주지.',
        '오늘은 나랑 같이 이 시스템에 자네의 기본 정보를 등록해보자고.',
        '아주 쉬운 것부터 시작할 테니 걱정 말게!'
      ],
      character: 'tom_nook',
      npcName: 'Tom Nook'
    }
  ];

  // 텍스트 타이핑 효과
  useEffect(() => {
    if (!isTyping) return;

    const currentScene = scenes[currentSceneIndex];
    const currentDialogue = currentScene.dialogues[currentDialogueIndex];

    if (!currentDialogue) return;

    const typingSpeed = 50; // ms per character
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex <= currentDialogue.length) {
        setDisplayedText(currentDialogue.substring(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [currentSceneIndex, currentDialogueIndex, isTyping, scenes]);

  // 다음 대사로
  const handleNextDialogue = () => {
    const currentScene = scenes[currentSceneIndex];

    if (currentDialogueIndex < currentScene.dialogues.length - 1) {
      setCurrentDialogueIndex(currentDialogueIndex + 1);
      setDisplayedText('');
      setIsTyping(true);
    } else {
      // 다음 씬으로
      if (currentSceneIndex < scenes.length - 1) {
        setCurrentSceneIndex(currentSceneIndex + 1);
        setCurrentDialogueIndex(0);
        setDisplayedText('');
        setIsTyping(true);
      } else {
        // 스토리 완료 → IDE로 이동
        navigate('/ide');
      }
    }
  };

  // 스킵 버튼
  const handleSkip = () => {
    navigate('/ide');
  };

  const currentScene = scenes[currentSceneIndex];
  const currentDialogue = currentScene.dialogues[currentDialogueIndex];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black flex items-center justify-center">
      {/* 배경 이미지 */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
        style={{
          backgroundImage: `url('${currentScene.image}')`,
          opacity: 0.9
        }}
      />

      {/* 다크 오버레이 */}
      <div className="absolute inset-0 bg-black opacity-40 z-10" />

      {/* IDE 윈도우 매니저 */}
      <IDEWindowManager />

      {/* 메인 콘텐츠 */}
      <div className="relative z-20 w-full h-full flex flex-col justify-end pb-12 px-4">
        {/* 대사 박스 */}
        <div className="max-w-4xl mx-auto w-full">
          {/* NPC 이름 */}
          <div className="mb-2">
            <span className="text-white font-bold text-sm md:text-base bg-black bg-opacity-70 px-4 py-1 rounded inline-block">
              {currentScene.npcName}
            </span>
          </div>

          {/* 대사 박스 */}
          <div className="bg-white border-4 border-yellow-700 rounded-lg p-6 md:p-8 shadow-2xl min-h-32 md:min-h-40 flex flex-col justify-center">
            {/* 대사 텍스트 */}
            <p className="text-yellow-900 font-semibold text-base md:text-lg leading-relaxed">
              {displayedText}
              {isTyping && <span className="animate-pulse">▋</span>}
            </p>

            {/* 진행 상황 표시 */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span>
                  {currentSceneIndex + 1} / {scenes.length} (
                  {currentDialogueIndex + 1} / {currentScene.dialogues.length})
                </span>
              </div>

              {/* 버튼 그룹 */}
              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 bg-gray-400 text-white font-bold rounded hover:bg-gray-500 transition text-sm md:text-base"
                >
                  스킵
                </button>
                <button
                  onClick={handleNextDialogue}
                  className="px-6 py-2 bg-gradient-to-br from-blue-600 to-blue-800 text-yellow-300 font-black rounded hover:from-blue-700 hover:to-blue-900 transition text-base md:text-lg shadow-lg"
                >
                  {currentSceneIndex === scenes.length - 1 &&
                  currentDialogueIndex === currentScene.dialogues.length - 1
                    ? '🚀 시작하기'
                    : '다음 →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryPage;
