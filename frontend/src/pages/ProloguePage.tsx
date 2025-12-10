import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 다이얼로그 타입 정의
type DialogueStep = {
    id: number;
    speaker: string;
    text: string;
    expression?: 'neutral' | 'shock' | 'happy' | 'panic';
    background?: string;
    isEpisodeStart?: boolean; // 에피소드 시작 타이틀 표시용
    episodeTitle?: string;
};

// 스토리 대본 (Project Re-Boot)
const script: DialogueStep[] = [
    // ==========================================
    // Episode 1: 너굴의 경제학 - 빚과 상태(State)
    // ==========================================
    {
        id: 1,
        speaker: "System",
        text: "Chapter 1. 무인도 이주 패키지와 [빚의 굴레]",
        expression: 'neutral',
        background: 'bg-black',
        isEpisodeStart: true,
        episodeTitle: "너굴의 경제학: 변수와 상태"
    },
    {
        id: 2,
        speaker: "너굴(Tom Nook)",
        text: "자, 여기 청구서 구리! 무인도 이주 패키지 비용... 도합 49,800벨이야!",
        expression: 'happy',
        background: 'bg-[#FDF5E6]'
    },
    {
        id: 3,
        speaker: "나(Player)",
        text: "네?! 도착하자마자 빚쟁이라고요?",
        expression: 'shock',
        background: 'bg-[#FDF5E6]'
    },
    {
        id: 4,
        speaker: "너굴(Tom Nook)",
        text: "걱정 마구리. '도망'만 안 가면 돼. 이 빚(Debt)은 아주 특별하니까.",
        expression: 'neutral',
        background: 'bg-[#FDF5E6]'
    },
    {
        id: 5,
        speaker: "너굴(Tom Nook)",
        text: "컴퓨터 과학에서는 이걸 **'상태(State)'**라고 부르지. 자네가 게임을 끄고 도망쳐도, 이 빚은 영원히 데이터베이스에 남아있어 (영속성)!",
        expression: 'happy', // 약간 사악한 미소
        background: 'bg-[#FDF5E6]'
    },
    {
        id: 6,
        speaker: "너굴(Tom Nook)",
        text: "물론 자네가 노동을 해서 돈을 갚으면 값은 변하지 (가변성). 그게 바로 변수(Variable)의 본질이야!",
        expression: 'neutral',
        background: 'bg-[#FDF5E6]'
    },
    {
        id: 7,
        speaker: "여울(Isabelle)",
        text: "신입 인턴님! 그럼 이 '빚'과 '이자율'을 데이터로 정의해볼까요? [Topic 1.2: Primitive Types]",
        expression: 'neutral',
        background: 'bg-green-50'
    },
    {
        id: 8,
        speaker: "여울(Isabelle)",
        text: "'벨(Bell)'은 소수점이 없으니 정수형 `int`를 써야 해요. 반면 '이자율'은 0.5%니까 실수형 `double`이어야 하죠.",
        expression: 'neutral',
        background: 'bg-green-50'
    },
    {
        id: 9,
        speaker: "나(Player)",
        text: "아하, 빚을 갚을 땐 `loanAmount -= pay` 처럼 복합 할당 연산자(Expression)를 쓰면 되겠네요!",
        expression: 'happy',
        background: 'bg-green-50'
    },
    {
        id: 10,
        speaker: "너굴(Tom Nook)",
        text: "똑똑하구만! 하지만 이자는 조심해. `(int)`로 캐스팅(Casting)해서 소수점은 다 잘라버리라고. 1벨이라도 더 줄 순 없지!",
        expression: 'panic', // 돈에 집착
        background: 'bg-[#FDF5E6]'
    },

    // ==========================================
    // Episode 2: Bank of Nook 시스템 구축
    // ==========================================
    {
        id: 11,
        speaker: "System",
        text: "Chapter 2. Bank of Nook 시스템 구축 [변수 선언의 함정]",
        expression: 'neutral',
        background: 'bg-black',
        isEpisodeStart: true,
        episodeTitle: "클래스 설계와 치명적 오류"
    },
    {
        id: 12,
        speaker: "여울(Isabelle)",
        text: "이제 본격적으로 너굴 포털의 계좌 시스템 `NookAccount` 클래스를 설계해봐요!",
        expression: 'happy',
        background: 'bg-blue-50'
    },
    {
        id: 13,
        speaker: "여울(Isabelle)",
        text: "우선 멤버 변수(인스턴스 변수)부터... 벨은 `int`, 이자율은 `double`... 맞죠?",
        expression: 'neutral',
        background: 'bg-blue-50'
    },
    {
        id: 14,
        speaker: "나(Player)",
        text: "잠깐, `int`는 21억까지만 저장되잖아요? 너굴 사장님 재산은 조 단위일 텐데 `long`을 써야 하지 않나요?",
        expression: 'shock',
        background: 'bg-blue-50'
    },
    {
        id: 15,
        speaker: "너굴(Tom Nook)",
        text: "음... 예리하구리. 하지만 AP CSA 시험 범위(Scope)에서는 `int`가 국룰이야! 일단 `int`로 가고 오버플로우는 나중에 생각하자고.",
        expression: 'panic',
        background: 'bg-[#FDF5E6]'
    },
    {
        id: 16,
        speaker: "여울(Isabelle)",
        text: "자, 그럼 코드를 볼까요? 전임 인턴 '콩돌이'가 짜고 간 코드예요.",
        expression: 'neutral',
        background: 'bg-gray-800'
    },
    {
        id: 17,
        speaker: "Code Review",
        text: "public class NookAccount {\n  private int bellBalance;\n  public NookAccount() {\n    int bellBalance = 0; // 👈 문제의 코드\n  }\n}",
        expression: 'neutral',
        background: 'bg-gray-900' // 코드 화면 느낌
    },
    {
        id: 18,
        speaker: "너굴(Tom Nook)",
        text: "이봐!! 계좌를 만들었는데 왜 잔고가 업데이트가 안 되는 거야! 내가 돈을 넣어도 계속 0원이잖아!",
        expression: 'panic',
        background: 'bg-red-900'
    },
    {
        id: 19,
        speaker: "나(Player)",
        text: "아! 이건 2025년 수석 채점자가 경고한 [생성자 내 재선언 오류]네요!",
        expression: 'shock',
        background: 'bg-red-900'
    },
    {
        id: 20,
        speaker: "여울(Isabelle)",
        text: "생성자 안에서 `int bellBalance = 0;`이라고 쓰면, 이건 '지역 변수'가 되어버려요!",
        expression: 'panic',
        background: 'bg-red-900'
    },
    {
        id: 21,
        speaker: "여울(Isabelle)",
        text: "생성자가 끝나면 이 지역 변수는 사라지고, 정작 중요한 인스턴스 변수 `this.bellBalance`는 건드리지도 못하는 거죠!",
        expression: 'panic',
        background: 'bg-red-900'
    },
    {
        id: 22,
        speaker: "나(Player)",
        text: "맞습니다. `int` 키워드를 빼고 `bellBalance = 0;` 이라고 써야, 진짜 계좌(인스턴스 변수)에 접근하게 됩니다.",
        expression: 'happy',
        background: 'bg-green-100'
    },
    {
        id: 23,
        speaker: "너굴(Tom Nook)",
        text: "휴... 자네 아니었으면 내 돈 다 날릴 뻔했구리. 코딩할 땐 '변수의 유효 범위(Scope)'를 항상 조심하게!",
        expression: 'happy',
        background: 'bg-[#FDF5E6]'
    },
    {
        id: 24,
        speaker: "System",
        text: "미션 성공! 은행 시스템의 치명적 결함이 수정되었습니다. 지금 바로 코드를 고치러 갑시다!",
        expression: 'neutral',
        background: 'bg-black'
    }
];

const ProloguePage: React.FC = () => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [displayedText, setDisplayedText] = useState("");
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);

    const currentStep = script[currentIndex];

    // 타이핑 효과
    useEffect(() => {
        setDisplayedText("");
        setIsTyping(true);

        let charIndex = 0;
        const text = currentStep.text;

        const timer = setInterval(() => {
            if (charIndex < text.length) {
                setDisplayedText((prev) => prev + text.charAt(charIndex));
                charIndex++;
            } else {
                setIsTyping(false);
                clearInterval(timer);
            }
        }, 30);

        return () => clearInterval(timer);
    }, [currentIndex]);

    // 자동 재생
    useEffect(() => {
        let autoTimer: NodeJS.Timeout;
        if (isAutoPlaying && !isTyping) {
            autoTimer = setTimeout(() => {
                handleNext();
            }, 2000); // 텍스트 읽을 시간 조금 더 여유롭게
        }
        return () => clearTimeout(autoTimer);
    }, [isAutoPlaying, isTyping, currentIndex]);

    const handleNext = () => {
        if (isTyping) {
            setDisplayedText(currentStep.text);
            setIsTyping(false);
        } else {
            if (currentIndex < script.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                // 스토리 종료 후 Unit 1 미션으로 이동
                navigate('/mission/unit-1-economics');
            }
        }
    };

    return (
        <div
            className={`w-screen h-screen relative flex items-center justify-center overflow-hidden transition-colors duration-500 ${currentStep.background}`}
            onClick={handleNext}
        >
            {/* 에피소드 타이틀 카드 (중간 삽입) */}
            {currentStep.isEpisodeStart && (
                <div className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center text-white animate-fadeIn">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter text-[#D68C45]">
                        {currentStep.episodeTitle}
                    </h1>
                    <p className="text-xl text-gray-400 animate-pulse">Click to Start Episode...</p>
                </div>
            )}

            {/* 배경 연출 (에러 상황 등) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <span className="text-9xl font-bold text-white uppercase tracking-widest">
                    {currentStep.expression === 'panic' ? 'ERROR' : ''}
                </span>
            </div>

            {/* 컨트롤러 */}
            <div
                className="absolute top-6 right-6 z-50 flex gap-2"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className={`px-4 py-2 rounded-full font-bold shadow-lg transition-all ${isAutoPlaying
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-white/80 text-gray-700 hover:bg-white'
                        }`}
                >
                    {isAutoPlaying ? '❚❚ 자동 재생 중' : '▶ 자동 재생'}
                </button>
            </div>

            {/* 대화창 UI */}
            <div className="absolute bottom-10 left-4 right-4 md:left-20 md:right-20 lg:left-40 lg:right-40 z-30">
                {/* 이름표 */}
                {currentStep.speaker !== "Code Review" && (
                    <div className={`
                        inline-block px-6 py-2 rounded-t-2xl font-bold text-xl text-white shadow-lg transform translate-y-2 ml-4
                        ${currentStep.speaker.includes("너굴") ? "bg-[#D68C45]" :
                            currentStep.speaker.includes("여울") ? "bg-[#EBCB8B]" :
                                currentStep.speaker.includes("System") ? "bg-gray-700" :
                                    "bg-[#4CAF50]"}
                    `}>
                        {currentStep.speaker}
                    </div>
                )}

                {/* 텍스트 박스 */}
                <div className={`
                    border-4 rounded-3xl p-6 md:p-8 min-h-[150px] shadow-2xl relative
                    ${currentStep.speaker === "Code Review"
                        ? "bg-[#1E1E1E] border-gray-600 text-green-400 font-mono text-sm md:text-lg"
                        : "bg-white/95 border-[#8D6E63] text-[#5D4037] text-lg md:text-2xl font-medium"}
                `}>
                    <p className="whitespace-pre-line leading-relaxed">
                        {displayedText}
                        <span className="animate-pulse">|</span>
                    </p>

                    {!isTyping && (
                        <div className="absolute bottom-4 right-6 animate-bounce text-[#D68C45]">
                            ▼
                        </div>
                    )}
                </div>

                <div className="text-right mt-2 text-white/80 text-sm font-semibold">
                    {isAutoPlaying ? '자동으로 진행됩니다...' : '클릭하여 진행...'}
                </div>
            </div>
        </div>
    );
};

export default ProloguePage;
