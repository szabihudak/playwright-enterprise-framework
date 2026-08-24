import type {TestUser} from "../api/models/User";

export function createTestUser(): TestUser {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
        username: `qa_${id}`,
        email: `qa_${id}@example.com`,
        password: 'TestPassword123!',
    }
}