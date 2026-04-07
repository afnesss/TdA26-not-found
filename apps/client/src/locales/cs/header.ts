const header = {
  navigation: {
    shop: 'Shop',
    courses: 'Kurzy',
    dashboard: 'Dashboard',
    requests: 'Zadosti',
    organizations: 'Organizace',
    menu: 'Menu',
  },
  actions: {
    signIn: 'Prihlasit se',
    signOut: 'Odhlasit se',
    createOrganization: 'Zalozit organizaci',
  },
  toasts: {
    logoutSuccess: 'Odhlaseni uspesne',
    logoutError: 'Chyba pri odhlasovani',
  },
} as const

export default header
