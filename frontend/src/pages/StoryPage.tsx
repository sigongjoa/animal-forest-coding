import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useDispatch, useSelector } from 'react-redux';
import { selectProgression } from '../store/slices/progressionSlice';
import { persistenceService } from '../services/PersistenceService';
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
  const dispatch = useDispatch();
  const progression = useSelector(selectProgression);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState<number>(0);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const typingIndexRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // TTS 오디오 재생
  const playDialogueAudio = async (text: string) => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play().catch(err => console.log('Audio play failed:', err));
        }
      }
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  // 텍스트 타이핑 효과
  useEffect(() => {
    const currentScene = scenes[currentSceneIndex];
    const currentDialogue = currentScene.dialogues[currentDialogueIndex];

    if (!currentDialogue) return;

    if (!isTyping) return;

    typingIndexRef.current = 0;
    const typingSpeed = 50; // ms per character

    const typingInterval = setInterval(() => {
      typingIndexRef.current++;
      if (typingIndexRef.current <= currentDialogue.length) {
        setDisplayedText(currentDialogue.substring(0, typingIndexRef.current));
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, typingSpeed);

    // 대사 시작할 때 오디오 재생
    playDialogueAudio(currentDialogue);

    return () => clearInterval(typingInterval);
  }, [currentSceneIndex, currentDialogueIndex, isTyping]);

  // 스토리 진행상황 저장 및 IDE로 이동
  const saveProgressionAndNavigate = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId) {
        console.warn('⚠️ No userId found, navigating without saving');
        navigate('/ide');
        return;
      }

      // 진행상황 업데이트
      const updatedProgression = {
        studentId: progression.studentId || userId,
        episodeId: progression.episodeId || 'ep_1',
        completedMissions: progression.completedMissions.includes('story')
          ? progression.completedMissions
          : [...progression.completedMissions, 'story'],
        currentMissionIndex: Math.max(progression.currentMissionIndex, 1),
        points: progression.points + 100,
        badges: progression.badges.includes('story-complete')
          ? progression.badges
          : [...progression.badges, 'story-complete'],
        lastModified: Date.now(),
      };

      // localStorage에 저장
      persistenceService.saveToLocalStorage(updatedProgression);
      console.log('✅ Progress saved to localStorage');

      // Backend에도 동기화 (로그인한 경우)
      if (token) {
        try {
          await persistenceService.saveToBackend(updatedProgression, token);
          console.log('✅ Progress synced to backend');
        } catch (error) {
          console.warn('⚠️ Backend sync failed, but local save succeeded:', error);
        }
      }

      navigate('/ide');
    } catch (error) {
      console.error('❌ Error saving progression:', error);
      navigate('/ide');
    }
  };

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
        // 스토리 완료 → 진행상황 저장 후 IDE로 이동
        saveProgressionAndNavigate();
      }
    }
  };

  // 스킵 버튼
  const handleSkip = () => {
    saveProgressionAndNavigate();
  };

  const currentScene = scenes[currentSceneIndex];
  const currentDialogue = currentScene.dialogues[currentDialogueIndex];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black flex items-center justify-center">
      {/* 오디오 요소 */}
      <audio ref={audioRef} className="hidden" />

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
            {/* 대사 텍스트 - 마크다운 렌더링 */}
            <div className="text-yellow-900 font-semibold text-base md:text-lg leading-relaxed">
              <ReactMarkdown
                components={{
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold text-yellow-950" {...props} />
                  ),
                  em: ({ node, ...props }) => (
                    <em className="italic text-yellow-800" {...props} />
                  ),
                  code: ({ node, ...props }) => (
                    <code className="bg-yellow-100 px-1 py-0.5 rounded font-mono text-sm" {...props} />
                  ),
                  p: ({ node, ...props }) => <>{props.children}</>,
                }}
              >
                {displayedText}
              </ReactMarkdown>
              {isTyping && <span className="animate-pulse">▋</span>}
            </div>

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
