const courses = {
  pageTitle: 'Kurzy',
  organizationPageTitle: 'Kurzy organizace',
  heading: 'Dostupné kurzy',
  searchPlaceholder: 'Vyhledat kurz...',
  filterAriaLabel: 'Filtrovat kurzy',
  sorting: {
    newest: 'Nejnovější',
    oldest: 'Nejstarší',
  },
  statuses: {
    live: 'Aktivní',
    planned: 'Naplánované',
    paused: 'Pozastavené',
  },
  empty: {
    noCourses: 'Žádné kurzy k zobrazení',
  },
  actions: {
    resetFilters: 'Zrušit filtry',
    loadMore: 'Načíst další kurzy',
  },
} as const

export default courses
