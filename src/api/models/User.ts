export type  TestUser = {
    username: string;
    email: string;
    password: string;
}

export type AuthenticatedUser = TestUser & {
    token: string;
};