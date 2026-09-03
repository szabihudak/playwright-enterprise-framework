export type TaskRequest = {
    "title": string,
    "description": string,
    "priority": string,
    "status": string
};
export type TaskResponse = {
    "id": string,
    "userId": string,
    "title": string,
    "description": string,
    "status": string,
    "priority": string,
    "position": number,
    "createdAt": string,
    "updatedAt": string
};