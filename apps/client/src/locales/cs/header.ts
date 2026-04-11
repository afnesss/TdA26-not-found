const header = {
  navigation: {
    home: 'Úvod',
    shop: 'Shop',
    courses: 'Kurzy',
    dashboard: 'Dashboard',
    requests: 'Žádosti',
    orders: 'Objednávky',
    organizations: 'Organizace',
    menu: 'Menu',
  },
  actions: {
    signIn: 'Přihlásit se',
    signOut: 'Odhlásit se',
    createOrganization: 'Založit organizaci',
    goHome: 'Přejít na úvodní stránku',
  },
  toasts: {
    logoutSuccess: 'Odhlášení úspěšné',
    logoutError: 'Chyba při odhlašování',
  },
} as const

export default header
