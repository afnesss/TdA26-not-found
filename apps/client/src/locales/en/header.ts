const header = {
  navigation: {
    shop: 'Shop',
    courses: 'Courses',
    dashboard: 'Dashboard',
    requests: 'Requests',
    organizations: 'Organizations',
    menu: 'Menu',
  },
  actions: {
    signIn: 'Sign in',
    signOut: 'Sign out',
    createOrganization: 'Create organization',
    goHome: 'Go to home page',
  },
  toasts: {
    logoutSuccess: 'Signed out successfully',
    logoutError: 'Failed to sign out',
  },
} as const

export default header
