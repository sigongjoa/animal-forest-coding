import { Mission } from '../../types/Mission';

export const unit2Mission: Mission & { validator: (code: string) => { passed: boolean; message: string } } = {
    id: 'unit-2-fishing',
    title: 'Unit 2: 낚시 대회의 제왕 - 저스틴의 챌린지',
    description: '제어 구조 (Selection & Iteration)를 마스터하여 낚시 대회에서 우승하세요!',
    difficulty: 'intermediate',
    order: 2,
    rewards: {
        basePoints: 200,
        speedBonus: 100,
        perfectBonus: 100
    },
    unlocks: ['unit-3-algorithms'],
    prerequisites: ['unit-1-economics'],
    steps: [
        {
            id: 1,
            title: 'Scene 1: 대회의 서막 (참가 자격 심사)',
            description: `**(마을 광장, 저스틴이 화려한 포즈를 취하며 서 있다.)**\n\n**Noob:** "너굴 사장님, 우리 섬에 활력이 필요해요. 낚시 전문가를 모셔왔습니다!"\n\n**저스틴:** "요! 안녕, 낚시 친구들? 내가 바로 C.J.! 오늘 물고기 좀 낚아볼까? 영상을 찍어서 내 '스트림'에 올릴 거니까 준비 단단히 하라구!"\n\n**너굴:** "환영하구리! 하지만 대회 운영은 공짜가 아니지. 참가비를 받고, 주머니 공간도 확인해야 한다구리. 자바(Java)로 심사 코드를 짜보자구리."\n\n**저스틴:** "심플해! 참가비는 500벨이야. 그리고 물고기를 넣을 주머니(Inventory)가 비어 있어야 하지. 이 두 가지가 동시에 충족되어야 '참가(True)'야!"`,
            prompt: '참가 자격(canJoin)을 결정하는 if-else 코드를 작성하세요.',
            template: `public class FishingTournament {
    public boolean checkEligibility(int myBells, boolean isPocketFull) {
        boolean canJoin = false;
        
        // [작성할 코드]: 돈이 500 이상이고(AND), 주머니가 꽉 차지 않았다면(NOT) 참가 가능
        // 조건이 맞으면 canJoin을 true로 변경하고 환영 메시지를 출력하세요.
        // 아니면 거절 메시지를 출력하세요.
        
        
        return canJoin;
    }
}`,
            solution: `public class FishingTournament {
    public boolean checkEligibility(int myBells, boolean isPocketFull) {
        boolean canJoin = false;
        
        if (myBells >= 500 && !isPocketFull) {
            canJoin = true;
            System.out.println("참가 등록 완료! 낚싯대를 챙기라구!");
        } else {
            System.out.println("참가 불가! 돈이 없거나 주머니를 비우고 오라구!");
        }
        
        return canJoin;
    }
}`,
            prerequisites: []
        },
        {
            id: 2,
            title: 'Scene 2: 저스틴의 낚시 로봇 (반복문 기초)',
            description: `**저스틴:** "참가자가 너무 많아서 내가 다 심사할 수 없어. 그래서 내가 개발한 **'오토-피싱봇(Auto-Fishing Bot)'**을 가져왔지! 이 녀석은 두 가지 모드로 작동해."\n\n**Noob:** "오... 최첨단이네. 어떻게 작동하는데?"\n\n**저스틴:** "잘 들어! 상황에 맞춰서 명령을 내려야 해."\n\n**(1) For문 모드:** "딱 10번만 던져!" (미끼가 10개뿐)\n**(2) While문 모드:** "10마리 잡을 때까지 집에 안 가!"`,
            prompt: 'For 루프(횟수 반복)와 While 루프(조건 반복)를 모두 구현하세요.',
            template: `public class FishingBot {
    public void startFishingBot() {
        // (1) For문 모드: "딱 10번만 던져!"
        System.out.println("=== For문 로봇 가동 ===");
        // TODO: 0부터 9까지 총 10회 반복하며 fishing()을 호출하세요.
        
        
        
        // (2) While문 모드: "10마리 잡을 때까지 집에 안 가!"
        System.out.println("=== While문 로봇 가동 ===");
        int fishCount = 0;
        // TODO: fishCount가 10보다 작은 동안 반복하세요.
        // fishing()이 true를 반환하면 fishCount를 1 증가시키세요.
        
        
        
        System.out.println("목표 달성! 퇴근!");
    }
    
    // 낚시 시도 (50% 확률로 성공) - 수정하지 마세요
    private boolean fishing() { return Math.random() > 0.5; }
}`,
            solution: `public class FishingBot {
    public void startFishingBot() {
        System.out.println("=== For문 로봇 가동 ===");
        for (int i = 0; i < 10; i++) {
            fishing();
            System.out.println((i + 1) + "번째 캐스팅 완료!");
        }
        
        System.out.println("=== While문 로봇 가동 ===");
        int fishCount = 0;
        while (fishCount < 10) {
            boolean success = fishing();
            if (success) {
                fishCount++;
                System.out.println("현재 " + fishCount + "마리 획득!");
            } else {
                System.out.println("놓쳤다! 다시 시도...");
            }
        }
    }
    
    private boolean fishing() { return Math.random() > 0.5; }
}`,
            prerequisites: [],
            scenario: {
                setting: {
                    background: '/assets/background/beach_day.png',
                    characters: [
                        { id: 'justin', initialPosition: { x: 500, y: 300 }, sprite: '/assets/character/justin.png', direction: 'left' },
                        { id: 'nook', initialPosition: { x: 200, y: 300 }, sprite: '/assets/character/nook.png', direction: 'right' }
                    ]
                },
                script: [
                    { type: 'emote', target: 'justin', emoji: '🤖' },
                    { type: 'dialogue', speaker: 'justin', text: '참가자가 너무 많아서 내가 다 심사할 수 없어. 그래서 내가 개발한 "오토-피싱봇"을 가져왔지!', emotion: 'happy' },
                    { type: 'dialogue', speaker: 'nook', text: '오... 최첨단이네. 어떻게 작동하는데?', emotion: 'neutral' },
                    { type: 'dialogue', speaker: 'justin', text: '두 가지 모드가 있어. "10번만 던져(For)" 모드랑 "10마리 잡을 때까지(While)" 모드지!', emotion: 'happy' },
                    { type: 'transition', mode: 'IDE' }
                ]
            }
        },
        {
            id: 3,
            title: 'Scene 3: 전설의 갸라도스를 찾아서 (중첩 반복문)',
            description: `**저스틴:** "이제 기본은 됐고, '전설의 낚시왕' 칭호에 도전해볼까? 이 섬에는 3개의 비밀 낚시터가 있어. 각 낚시터마다 물고기를 5마리씩 낚고 이동하는 거야!"\n\n**Noob:** "잠깐, 3군데를 돌면서 각각 5마리씩? 그럼 루프 안에 루프를 넣어야겠네?"`,
            prompt: '3개의 낚시터를 돌며 각각 5마리씩 잡는 중첩 루프를 구현하세요.',
            template: `public class GyaradosHunt {
    public void startHunt() {
        // TODO: 외부 루프 (낚시터 1번 ~ 3번)
        for (int spot = 1; spot <= 3; spot++) {
            System.out.println("📍 " + spot + "번 낚시터 도착!");
            
            int fishInBucket = 0;
            
            // TODO: 내부 루프 (해당 낚시터에서 5마리 채울 때까지)
            
            
            System.out.println("✅ " + spot + "번 낚시터 클리어! 다음 장소로 이동구리~");
        }
        System.out.println("🎉 전설의 낚시왕 등극!");
    }
    
    private void fishing() {}
}`,
            solution: `public class GyaradosHunt {
    public void startHunt() {
        for (int spot = 1; spot <= 3; spot++) {
            System.out.println("📍 " + spot + "번 낚시터 도착!");
            int fishInBucket = 0;
            while (fishInBucket < 5) {
                fishing();
                fishInBucket++;
                System.out.println("  🐟 " + fishInBucket + "마리째 낚음!");
            }
            System.out.println("✅ " + spot + "번 낚시터 클리어! 다음 장소로 이동구리~");
        }
        System.out.println("🎉 전설의 낚시왕 등극!");
    }
    private void fishing() {}
}`,
            prerequisites: [],
            scenario: {
                setting: {
                    background: '/assets/background/beach_day.png',
                    characters: [
                        { id: 'justin', initialPosition: { x: 400, y: 300 }, sprite: '/assets/character/justin.png', direction: 'down' }
                    ]
                },
                script: [
                    { type: 'move', target: 'justin', to: { x: 400, y: 350 }, speed: 'run' },
                    { type: 'dialogue', speaker: 'justin', text: '좋아! 이제 "전설의 낚시왕" 칭호에 도전해볼까? 이 섬엔 3개의 비밀 낚시터가 있지.', emotion: 'happy' },
                    { type: 'emote', target: 'justin', emoji: '🐟' },
                    { type: 'dialogue', speaker: 'justin', text: '각 낚시터마다 물고기를 5마리씩 낚고 이동해야 해! 총 15마리지!', emotion: 'happy' },
                    { type: 'dialogue', speaker: 'nook', text: '3군데를 돌면서 각각 5마리라... 루프 안에 루프를 넣는 "중첩 반복문"이 필요하겠구리!', emotion: 'thinking' },
                    { type: 'transition', mode: 'IDE' }
                ]
            }
        },
        {
            id: 4,
            title: 'Scene 4: [보너스] 너굴의 보안 점검 & 무파니의 비밀',
            description: `**(대회가 끝나고 밤이 되었다. 너굴과 무파니가 심각한 표정으로 찾아왔다.)**\n\n**너굴:** "큰일 났다구리! 해커가 대회 데이터베이스에 가짜 데이터를 심어놨어. 그리고 무파니는 금고 비밀번호를 까먹었다고 울고 있다구리!"\n\n**Noob:** "피곤해 죽겠는데... 알았어, 해결해 줄게."\n\n**(1) 스파이 물고기 해독:** 문자열 사이에 숨겨진 숫자(1~6) 제거하기\n**(2) 무파니의 비밀번호:** 무 가격(592)의 각 자릿수 합 구하기`,
            prompt: '문자열 파싱 알고리즘과 자릿수 합 알고리즘을 구현하세요.',
            template: `public class SecurityFix {
    public void fixSecurity() {
        // [Mission 4-1] 스파이 물고기 해독 (String Algorithm)
        String secretCode = "S1e2a3 B4a5s6s";
        String realName = "";

        // TODO: 문자열 길이만큼 반복하며 한 글자씩 뜯어보기
        // 숫자가 아니면 realName에 붙이세요.
        
        System.out.println("해독된 이름: " + realName);


        // [Mission 4-2] 무파니의 비밀번호 (Digit Algorithm)
        int price = 592;
        int sum = 0;

        // TODO: 숫자가 0이 될 때까지 반복하며 자릿수 더하기 (% 10, / 10 사용)
        
        System.out.println("비밀번호는 " + sum + "입니다!");
    }
}`,
            solution: `public class SecurityFix {
    public void fixSecurity() {
        String secretCode = "S1e2a3 B4a5s6s";
        String realName = "";
        for (int i = 0; i < secretCode.length(); i++) {
            char c = secretCode.charAt(i);
            if (!Character.isDigit(c)) {
                realName += c;
            }
        }
        
        int price = 592;
        int sum = 0;
        while (price > 0) {
            sum += price % 10;
            price /= 10;
        }
    }
}`,
            prerequisites: [],
            scenario: {
                setting: {
                    background: '/assets/background/beach_night.png',
                    characters: [
                        { id: 'nook', initialPosition: { x: 250, y: 300 }, sprite: '/assets/character/nook.png', direction: 'right' },
                        { id: 'daisy', initialPosition: { x: 400, y: 320 }, sprite: '/assets/character/daisy.png', direction: 'left' }
                    ]
                },
                script: [
                    { type: 'wait', duration: 1000 },
                    { type: 'emote', target: 'nook', emoji: '😰' },
                    { type: 'dialogue', speaker: 'nook', text: '큰일 났다구리! 대회가 끝나자마자 해커가 침입했어!', emotion: 'shocked' },
                    { type: 'emote', target: 'daisy', emoji: '😭' },
                    { type: 'dialogue', speaker: 'daisy', text: '흑흑... 무(Turnip) 팔아서 번 돈을 금고에 넣었는데, 비밀번호를 까먹었어요...', emotion: 'sad' },
                    { type: 'dialogue', speaker: 'nook', text: '데이터베이스의 가짜 물고기와 무파니의 비밀번호... 두 가지 문제를 동시에 해결해 주게!', emotion: 'concerned' },
                    { type: 'transition', mode: 'IDE' }
                ]
            }
        }
    ],
    scenario: {
        setting: {
            background: '/assets/background/beach_day.png',
            characters: [
                {
                    id: 'justin',
                    initialPosition: { x: 500, y: 300 },
                    sprite: '/assets/character/justin.png',
                    direction: 'left'
                },
                {
                    id: 'nook',
                    initialPosition: { x: 200, y: 300 },
                    sprite: '/assets/character/nook.png',
                    direction: 'right'
                },

            ]
        },
        script: [
            { type: 'dialogue', speaker: 'nook', text: '너굴 사장님, 우리 섬에 활력이 필요해요. 낚시 전문가를 모셔왔습니다!', emotion: 'neutral' },
            { type: 'dialogue', speaker: 'justin', text: '요! 안녕, 낚시 친구들? 내가 바로 C.J.! 오늘 물고기 좀 낚아볼까?', emotion: 'happy' },
            { type: 'dialogue', speaker: 'nook', text: '환영하구리! 하지만 대회 운영은 공짜가 아니지. 참가비를 받고, 주머니 공간도 확인해야 한다구리.', emotion: 'normal' },
            { type: 'dialogue', speaker: 'justin', text: '심플해! 참가비는 500벨이고, 주머니가 비어 있어야 참가(True)야!', emotion: 'happy' },
            { type: 'transition', mode: 'IDE' }
        ]
    },
    validator: (code: string) => {
        // Remove whitespace for easier parsing
        const cleanCode = code.replace(/\s+/g, '');

        // Step 1: Check Eligibility
        if (code.includes("checkEligibility")) {
            const hasBellCheck = cleanCode.includes("myBells>=500") || cleanCode.includes("500<=myBells");
            const hasPocketCheck = cleanCode.includes("!isPocketFull") || cleanCode.includes("isPocketFull==false");
            const hasAndLogic = cleanCode.includes("&&");

            if (hasBellCheck && hasPocketCheck && hasAndLogic) {
                return { passed: true, message: "참가 등록 완료! 완벽한 조건문이다구리!" };
            }
            return { passed: false, message: "조건을 다시 확인해봐! (돈은 500벨 이상, 그리고 주머니는 비워야 해)" };
        }

        // Step 2: Fishing Bot
        if (code.includes("startFishingBot")) {
            const hasForLoop = cleanCode.includes("for(inti=0;i<10;i++)") || cleanCode.includes("i<=9") || code.includes("for (int i");
            const hasWhileLoop = cleanCode.includes("while(fishCount<10)") || cleanCode.includes("fishCount<=9");

            if (hasForLoop && hasWhileLoop) {
                return { passed: true, message: "오토 로봇 가동! 물고기가 쏟아진다!" };
            }
            return { passed: false, message: "로봇 모드를 두 개 다 완성해야 해. For(10번) & While(10마리)!" };
        }

        // Step 3: Nested Loops
        if (code.includes("GyaradosHunt")) {
            const hasNested = code.includes("for") && code.includes("while") && cleanCode.includes("fishInBucket<5");
            if (hasNested) {
                return { passed: true, message: "🎉 전설의 낚시왕 등극! 모든 낚시터를 정복했어!" };
            }
            return { passed: false, message: "3군데 낚시터(Outer)에서 각각 5마리(Inner)씩 잡아야 해!" };
        }

        // Step 4: Security Fix
        if (code.includes("SecurityFix")) {
            const hasMod = cleanCode.includes("%10");
            const hasDiv = cleanCode.includes("/10");
            const hasCharCheck = code.includes("Character.isDigit");

            if (hasMod && hasDiv && hasCharCheck) {
                return { passed: true, message: "무파니의 비밀번호를 찾았다! 보안 시스템 복구 완료!" };
            }
            return { passed: false, message: "자릿수 합에는 % 10, / 10이 필요하고, 문자열엔 isDigit 확인이 필요해!" };
        }

        return { passed: false, message: "코드를 다시 점검해봐!" };
    }
};
