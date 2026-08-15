export const requiresDocumentNavigation = (actionUrl: string) => (
  actionUrl.startsWith('/admin/')
);
