export type SessionUser = {
  id: string;
  name: string;
  email: string;
  permissions: string[];
};

export type AuthPayload = {
  user: SessionUser | null;
};
