export const isGlobalAdmin = (user) => (
  user?.is_admin === true ||
  user?.role === 'admin' ||
  user?.account_role === 'admin'
)
