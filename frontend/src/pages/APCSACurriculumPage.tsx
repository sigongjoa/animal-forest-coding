import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const APCSACurriculumPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeUnit, setActiveUnit] = useState<number | null>(null);

    const toggleUnit = (unitIndex: number) => {
        if (activeUnit === unitIndex) {
            setActiveUnit(null);
        } else {
            setActiveUnit(unitIndex);
        }
    };

    const units = [
        {
            id: 1,
            title: "Unit 1. 경제 시스템 복구: 변수와 데이터 타입",
            story: "너굴 뱅크의 전산망이 마비되었습니다. 대출금 이자가 소수점으로 쪼개져 데이터베이스 오류를 일으키고, 무 주식 대박으로 인한 정수 오버플로우가 발생해 은행 잔고가 음수가 되는 사태를 수습해야 합니다.",
            modules: [
                {
                    title: "1.1 벨(Bell)의 정체성 (Primitive Types)",
                    topic: "AP Topic: 1.1 Why Programming? / 1.2 Variables and Data Types",
                    mission: "화폐 단위인 `Bell`을 정의하고 올바른 데이터 타입을 선택합니다.",
                    code: `// int: 셀 수 있는 화폐 (벨)
int currentBells = 5000;
// double: 정밀한 이자율
double interestRate = 0.005;`
                },
                {
                    title: "1.2 너굴의 \"내림\" 정책 (Casting & Expressions)",
                    topic: "AP Topic: 1.3 Expressions / 1.5 Casting",
                    mission: "이자 계산 시 발생하는 소수점을 처리합니다.",
                    code: `double interest = currentBalance * 0.005; // 52.75
int payout = (int) interest; // 52 (강제 형변환으로 버림)
// 너굴은 0.75벨조차 주지 않는다!`
                },
                {
                    title: "1.3 무 주식 대폭락 (Integer Overflow)",
                    topic: "AP Topic: 1.5.B Integer overflow logic",
                    mission: "정수형 변수의 한계를 이해하고 오버플로우를 방지합니다.",
                    code: `// 무 4백만개 * 600벨 = 24억 (int 범위 초과!)
// 예외 처리 필요`
                }
            ]
        },
        {
            id: 2,
            title: "Unit 2. 낚시 대회 디버깅: 제어 구조와 논리",
            story: "저스틴이 주최하는 낚시 대회의 타이머가 멈추지 않는 무한 루프에 빠졌습니다. 참가 자격이 없는 플레이어를 입구에서 차단하고, 물고기 판별 AI의 오류를 수정하여 대회를 정상화해야 합니다.",
            modules: [
                {
                    title: "2.1 입구 컷 알고리즘 (Boolean Logic)",
                    topic: "AP Topic: 2.1 Boolean Expressions / 2.6 De Morgan's Laws",
                    mission: "대회 참가 자격을 논리식으로 구현합니다.",
                    code: `boolean hasFee = balance >= 500;
boolean isPocketFull = pocket.size() >= 20;

// 참가 가능
if (hasFee && !isPocketFull) { ... }

// 참가 불가 (드 모르간 법칙)
// !(hasFee && !isPocketFull) == (!hasFee || isPocketFull)`
                },
                {
                    title: "2.2 끝나지 않는 대회 (Iteration)",
                    topic: "AP Topic: 3.1 Boolean Expressions / 4.1 While Loops",
                    mission: "정확한 타이머 종료 조건을 설정합니다.",
                    code: `while (time > 0) {
  // 낚시 진행
  time--;
}`
                },
                {
                    title: "2.3 도미인가 농어인가? (String Comparison)",
                    topic: "AP Topic: 2.10 Comparing Objects",
                    mission: "물고기 이름을 올바르게 비교하여 점수를 매깁니다.",
                    code: `// 틀린 코드
if (fishName == "Sea Bass") { ... }

// 올바른 코드
if (fishName.equals("Sea Bass")) { ... }`
                }
            ]
        },
        {
            id: 3,
            title: "Unit 3. 주민 자아 복원: 객체 지향 프로그래밍(OOP)",
            story: "해커의 공격으로 주민들의 기억(데이터)이 뒤섞였습니다. '잭슨'이 '운동광' 성격으로 변하거나, 친밀도가 멋대로 조작되고 있습니다. 클래스라는 설계도를 다시 그려 주민들의 정체성을 보호해야 합니다.",
            modules: [
                {
                    title: "3.1 주민 등록부 설계 (Class Design)",
                    topic: "AP Topic: 5.1 Anatomy of a Class / 5.2 Constructors",
                    mission: "`Villager` 클래스를 정의합니다.",
                    code: `public class Villager {
  String name;
  String species;
  String personality;
  
  void talk() { ... }
}`
                },
                {
                    title: "3.2 기억 잠그기 (Encapsulation)",
                    topic: "AP Topic: 5.4 Accessor Methods / 5.5 Mutator Methods",
                    mission: "데이터 무결성을 위해 캡슐화를 적용합니다.",
                    code: `public class Villager {
    private int friendshipLevel; // private!
    
    public void gift(String item) {
        this.friendshipLevel++;
    }
}`
                },
                {
                    title: "3.3 이사 오기 (Constructors & this)",
                    topic: "AP Topic: 5.6 This Keyword",
                    mission: "생성자를 통해 주민 객체를 올바르게 초기화합니다.",
                    code: `public Villager(String name) {
    this.name = name;
}`
                }
            ]
        },
        {
            id: 4,
            title: "Unit 4. 지형 데이터 복구: 배열과 알고리즘",
            story: "섬의 물리 엔진이 고장 났습니다. 꽃 교배 알고리즘이 자기 자신과 교배를 시도해 에러를 뿜어내고, 플레이어가 섬 끝 절벽 너머로 추락하는 버그가 발생했습니다. 격자(Grid) 시스템을 재구축해야 합니다.",
            modules: [
                {
                    title: "4.1 주머니 정리 정돈 (Array vs ArrayList)",
                    topic: "AP Topic: 6.1 Arrays / 7.1 ArrayList",
                    mission: "고정 크기 데이터(Map Tile)와 가변 크기 데이터(Pocket)의 차이.",
                    code: `// 배열: 섬 지도 (크기 고정)
Tile[][] map = new Tile[100][100];
// ArrayList: 주머니 (크기 가변)
ArrayList<Item> pocket = new ArrayList<>();`
                },
                {
                    title: "4.2 지도 그리드 스캔 (2D Array Traversal)",
                    topic: "AP Topic: 8.1 2D Arrays / 8.2 Traversing 2D Arrays",
                    mission: "섬 전체(`Map[][]`)를 스캔하여 잡초의 위치를 파악합니다.",
                    code: `for (int r = 0; r < map.length; r++) {
    for (int c = 0; c < map[0].length; c++) {
        if (map[r][c].isWeed()) { removeWeed(); }
    }
}`
                },
                {
                    title: "4.3 꽃 교배 로직의 역설 (2D Algorithms)",
                    topic: "AP Topic: 8.2 (Simulations)",
                    mission: "\"이웃한 꽃\"을 찾되, **자기 자신을 포함하지 않는** 로직을 구현합니다.",
                    code: `// Self-Pairing Guard
if (isValid(r, c) && !(r == row && c == col)) {
    checkCrossBreeding(map[r][c]);
}`
                },
                {
                    title: "4.4 세상의 끝 (Boundary Checking)",
                    topic: "AP Topic: 6.4 Arrays: Creation and Access",
                    mission: "`ArrayIndexOutOfBoundsException` 방지.",
                    code: `if (r >= 0 && r < map.length && c >= 0 && c < map[0].length) {
    // 안전한 접근
}`
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#F0F8E8] text-[#555] font-sans p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="mb-8 text-center">
                    <div className="inline-block bg-[#4CAF50] text-white px-4 py-1 rounded-full text-sm font-bold mb-2 shadow-sm">
                        Nook Inc. Dev Team
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-[#5D4037] mb-2 drop-shadow-sm font-gamja">
                        프로젝트 리부트
                    </h1>
                    <p className="text-lg md:text-xl text-[#8D6E63] font-medium">
                        Project Re-Boot: 시스템 복구 매뉴얼
                    </p>
                </header>

                {/* Intro Card */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl mb-8 border-4 border-[#8BC34A]/30">
                    <h2 className="text-2xl font-bold text-[#5D4037] mb-4 flex items-center">
                        <span className="text-3xl mr-2">🚩</span> 작전 개요
                    </h2>
                    <p className="text-lg leading-relaxed mb-4 text-[#555]">
                        <strong className="text-[#4CAF50]">환영합니다, 신입 엔지니어님!</strong><br />
                        현재 이 섬은 레거시 코드의 버그(Glitch)로 인해 붕괴 위기에 처해 있습니다.
                        당신은 <strong>2025 AP CSA 평가 데이터</strong>에 기반한 최신 객체 지향 기술로
                        이 세계를 디버깅하고 정상화해야 합니다.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-[#FFF9C4] p-4 rounded-2xl border-2 border-[#FBC02D]/20">
                            <div className="text-2xl mb-2">🔭</div>
                            <h3 className="font-bold text-[#5D4037]">개념 시각화</h3>
                            <p className="text-sm">추상적 코드를 게임 속 현상으로 직접 목격</p>
                        </div>
                        <div className="bg-[#E1F5FE] p-4 rounded-2xl border-2 border-[#03A9F4]/20">
                            <div className="text-2xl mb-2">🎯</div>
                            <h3 className="font-bold text-[#5D4037]">취약점 공략</h3>
                            <p className="text-sm">2차원 배열 & 객체 설계 집중 훈련</p>
                        </div>
                        <div className="bg-[#FFEBEE] p-4 rounded-2xl border-2 border-[#FF5252]/20">
                            <div className="text-2xl mb-2">⌨️</div>
                            <h3 className="font-bold text-[#5D4037]">실전 코딩</h3>
                            <p className="text-sm">Bluebook 디지털 시험 완벽 적응</p>
                        </div>
                    </div>
                </div>

                {/* Curriculum Units (Accordion) */}
                <div className="space-y-6">
                    {units.map((unit) => (
                        <div key={unit.id} className="bg-white rounded-3xl shadow-lg border-b-8 border-[#A1887F]/20 overflow-hidden transform transition-all duration-300 hover:scale-[1.01]">
                            <div
                                className={`p-6 cursor-pointer flex justify-between items-center ${activeUnit === unit.id ? 'bg-[#8D6E63] text-white' : 'hover:bg-[#F5F5F5]'}`}
                                onClick={() => toggleUnit(unit.id)}
                            >
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold font-gamja">
                                        {unit.title}
                                    </h2>
                                </div>
                                <div className="text-3xl font-bold bg-white/20 w-10 h-10 rounded-full flex items-center justify-center">
                                    {activeUnit === unit.id ? '−' : '+'}
                                </div>
                            </div>

                            {activeUnit === unit.id && (
                                <div className="p-6 md:p-8 bg-[#FAFAFA] animate-fadeIn">
                                    <div className="bg-[#EFEBE9] p-4 rounded-xl mb-6 italic text-[#6D4C41] border-l-4 border-[#8D6E63]">
                                        " {unit.story} "
                                    </div>

                                    <div className="space-y-8">
                                        {unit.modules.map((module, idx) => (
                                            <div key={idx} className="relative pl-6 border-l-2 border-[#BDBDBD]">
                                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#8BC34A] border-2 border-white shadow-sm"></div>
                                                <h3 className="text-lg font-bold text-[#333] mb-1">{module.title}</h3>
                                                <p className="text-xs font-mono text-[#757575] mb-2 bg-[#EEEEEE] inline-block px-2 py-0.5 rounded">{module.topic}</p>
                                                <p className="text-sm text-[#555] mb-3">{module.mission}</p>
                                                <div className="bg-[#263238] rounded-lg p-4 shadow-inner text-left overflow-x-auto">
                                                    <pre className="text-xs md:text-sm font-mono text-[#C3E88D]">
                                                        {module.code}
                                                    </pre>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <footer className="mt-12 text-center text-[#9E9E9E] text-sm pb-8">
                    <p>© 2025 Nook Inc. Development Team. All rights reserved.</p>
                    <p className="mt-2">
                        <button
                            onClick={() => navigate('/')}
                            className="text-[#8BC34A] hover:underline font-bold"
                        >
                            ← 메인으로 돌아가기
                        </button>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default APCSACurriculumPage;
