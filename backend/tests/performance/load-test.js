import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 20 }, // Ramp up to 20 users
        { duration: '1m', target: 20 },  // Stay at 20 users
        { duration: '30s', target: 0 },  // Ramp down
    ],
};

export default function () {
    const url = 'http://localhost:5000/api/java/validate';
    const payload = JSON.stringify({
        missionId: 'mission-101',
        stepId: 'step-1',
        code: 'public class Solution { public static void main(String[] args) { System.out.println("Hello"); } }',
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = http.post(url, payload, params);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'duration < 2000ms': (r) => r.timings.duration < 2000, // Compilation is slow, so 2s budget
    });

    sleep(1);
}
