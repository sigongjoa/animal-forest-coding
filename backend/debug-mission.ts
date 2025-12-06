import { missionService } from './src/services/MissionService';

async function run() {
    try {
        console.log('Fetching mission-001...');
        const mission = await missionService.getMission('mission-001');
        console.log('Result:', mission);

        console.log('Fetching all missions...');
        const all = await missionService.getAllMissions();
        console.log('Total count:', all.length);
    } catch (error) {
        console.error('Error:', error);
    }
}

run();
