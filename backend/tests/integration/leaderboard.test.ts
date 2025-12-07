import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { databaseService } from '../../src/services/DatabaseService';
import { missionService } from '../../src/services/MissionService';
import path from 'path';
import fs from 'fs';

// 통합 테스트: Leaderboard
// SOP 2.1 통합 테스트 참조
describe('Integration Test: Leaderboard System', () => {

    // 테스트용 학생 데이터
    const testPlayers = [
        { studentId: 'top_player', points: 5000, completedMissions: ['m001', 'm002'], badges: ['b1'] },
        { studentId: 'mid_player', points: 3000, completedMissions: ['m001'], badges: [] },
        { studentId: 'low_player', points: 1000, completedMissions: [], badges: [] }
    ];

    beforeAll(async () => {
        // DB 초기화가 필요하다면 여기서 수행 (DatabaseService 생성자에서 자동 수행됨)
    });

    afterAll(() => {
        // DB 연결 종료
        databaseService.close();
    });

    beforeEach(async () => {
        // 각 테스트 전 데이터 초기화 (기존 데이터 삭제)
        for (const p of testPlayers) {
            await databaseService.clearProgressionFromDatabase(p.studentId);
        }
    });

    it('should retrieve leaderboard sorted by points descending', async () => {
        // 1. Arrange: 데이터 주입
        for (const p of testPlayers) {
            await databaseService.saveProgressionToDatabase({
                studentId: p.studentId,
                episodeId: 'ep_1',
                completedMissions: p.completedMissions,
                currentMissionIndex: 0,
                points: p.points,
                badges: p.badges,
                perfectMissionCount: 0,
                speedRunCount: 0,
                lastModified: Date.now()
            });
        }

        // 2. Act: Leaderboard 조회
        const result = await missionService.getLeaderboard(5);

        // 3. Assert: 정렬 및 데이터 검증
        expect(result.total).toBeGreaterThanOrEqual(3);

        // 상위 3명이 우리가 넣은 데이터와 일치하는지 확인 (다른 데이터가 있을 수도 있으므로 .find 사용하거나 필터링)
        const top3 = result.data.filter(p => testPlayers.some(tp => tp.studentId === p.studentId));

        // 점수 내림차순 검증
        expect(top3[0].studentId).toBe('top_player');
        expect(top3[0].points).toBe(5000);

        expect(top3[1].studentId).toBe('mid_player');
        expect(top3[1].points).toBe(3000);

        expect(top3[2].studentId).toBe('low_player');
        expect(top3[2].points).toBe(1000);
    });

    it('should limit the number of results', async () => {
        // 1. Arrange: 데이터 주입
        for (const p of testPlayers) {
            await databaseService.saveProgressionToDatabase({
                studentId: p.studentId,
                episodeId: 'ep_1',
                completedMissions: p.completedMissions,
                currentMissionIndex: 0,
                points: p.points,
                badges: p.badges,
                perfectMissionCount: 0,
                speedRunCount: 0,
                lastModified: Date.now()
            });
        }

        // 2. Act: 2명만 조회
        const result = await missionService.getLeaderboard(2);

        // 3. Assert
        expect(result.data.length).toBe(2);
        expect(result.data[0].studentId).toBe('top_player');
        expect(result.data[1].studentId).toBe('mid_player');
    });
});
