export const publicProfilePath = (username: string) => (
  `/users/${encodeURIComponent(username)}`
);
