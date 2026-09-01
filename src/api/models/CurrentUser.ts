export type ApiUser = {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  
  export type CurrentUser = {
    user: ApiUser;
  };