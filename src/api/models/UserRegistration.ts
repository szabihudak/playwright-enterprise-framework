export type RegisteredUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type UserRegistration = {
  message: string;
  user: RegisteredUser;
};
