export const getPostShareUrl = (postId: number | string) => (
  new URL(`/post/${postId}`, window.location.origin).toString()
);
