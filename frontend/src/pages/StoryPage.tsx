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

  // 스토리 데이터 - /episode/1/ 디렉토리의 이미지 사용
  const scenes: Scene[] = [
    {
      id: 1,
      image: '/episode/1/opening.jpg',
      dialogues: [
        '어서 오시게, 주민 대표!',
        '우리 섬 생활은 좀 익숙해졌나?',
        '다름이 아니라, 우리 섬도 이제 최첨단 디지털 시대를 맞이해서',
        "'무인도 이주 플랜 관리 시스템'을 도입했거든!",
        '이름하여... **Java**이라네!'
      ],
      character: 'tom_nook',
      npcName: 'Tom Nook'
    },
    {
      id: 2,
      image: '/episode/1/2.jpg',
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
    },
    {
      id: 3,
      image: '/episode/1/3.jpg',
      dialogues: [
        '좋아! 이제 첫 번째 레슨을 시작해볼까?',
        '변수(Variable)라는 게 뭔지 알아야겠네.',
        '변수는 마치 너굴포트의 저장소 같은 거야.',
        '물건을 보관했다가 필요할 때 꺼내듯이',
        '정보를 저장했다가 필요할 때 쓰는 거지.'
      ],
      character: 'tom_nook',
      npcName: 'Tom Nook'
    },
    {
      id: 4,
      image: '/episode/1/4.jpg',
      dialogues: [
        '예를 들면, 이런 식이야.',
        '만약 내가 열 개의 금화를 저장하고 싶다면',
        'int gold = 10;',
        '이렇게 적으면 되는 거지!',
        'int는 숫자, gold는 상자의 이름이라고 생각하면 돼.'
      ],
      character: 'tom_nook',
      npcName: 'Tom Nook'
    },
    {
      id: 5,
      image: '/episode/1/5.jpg',
      dialogues: [
        '이제 너가 직접 해봐!',
        '너굴 IDE에서 변수를 만들어보거라.',
        '금액, 이름, 높이 같은 정보들을 저장해보면서',
        '변수가 뭔지 느껴보면 좋겠어.',
        '이해가 안 가면 물어봐도 괜찮아!'
      ],
      character: 'tom_nook',
      npcName: 'Tom Nook'
    },
    {
      id: 6,
      image: '/episode/1/6.jpg',
      dialogues: [
        '정말 잘했어!',
        '변수는 프로그래밍의 가장 기본이거든.',
        '이제 이 지식으로 더 복잡한 것들을 배워나가면 돼.',
        '계속해서 다양한 데이터 타입을 배워보자.',
        '문자(String)도 있고, 소수(double)도 있어.'
      ],
      character: 'tom_nook',
      npcName: 'Tom Nook'
    },
    {
      id: 7,
      image: '/episode/1/7.jpg',
      dialogues: [
        '다음은 산술 연산이야.',
        '더하기, 빼기, 곱하기 같은 거지.',
        '변수에 저장된 숫자들을 계산할 수 있어.',
        'int a = 10;',
        'int b = 3;',
        'System.out.println(a + b);'
      ],
      character: 'tom_nook',
      npcName: 'Tom Nook'
    },
    {
      id: 8,
      image: '/episode/1/8.jpg',
      dialogues: [
        '좋아, 이제 조건문(if)을 배워볼 차례야.',
        '이건 마치 "만약 손님이 500벨 이상 구매하면',
        '10% 할인해주겠다"는 조건처럼',
        '특정 상황에서만 코드를 실행시키는 거지.',
        '프로그래밍에서 매우 중요한 개념이야!'
      ],
      character: 'tom_nook',
      npcName: 'Tom Nook'
    },
    {
      id: 9,
      image: '/episode/1/9.jpg',
      dialogues: [
        '반복문(loop)도 있어.',
        '같은 일을 여러 번 하는 게 프로그래밍이니까',
        'for 반복문을 쓰면 편하지.',
        'for (int i = 0; i < 5; i++) {',
        '  System.out.println(i);',
        '}'
      ],
      character: 'tom_nook',
      npcName: 'Tom Nook'
    },
    {
      id: 10,
      image: '/episode/1/10.jpg',
      dialogues: [
        '와! 정말 잘 따라오고 있네!',
        '이제 리스트(List)라는 게 있어.',
        '여러 개의 데이터를 한꺼번에 관리할 때 쓰지.',
        'ArrayList<String> fruits = new ArrayList<>();',
        '이렇게 하면 사과, 바나나 같은 과일들을',
        '한 데 모아서 관리할 수 있어.'
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
