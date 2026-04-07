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
    view: 'Zobrazit',
  },
  userCourse: {
    breadcrumbRoot: 'Kurzy',
    titleFallback: 'Kurz',
    leaderboardTitle: 'Leaderboard studentů',
    activeModulesTitle: 'Aktivní moduly',
    noActiveModules: 'Kurz zatím nemá žádné aktivní moduly',
    moduleTitleFallback: '{{courseName}} - modul',
    moduleNotFound: 'Modul nebyl nalezen',
    materialsTitle: 'Studijní materiály',
    noMaterials: 'Zatím žádné materiály',
    quizzesTitle: 'Kvízy',
    noQuizzes: 'Zatím žádné kvízy',
    feedSection: {
      title: 'Oznámení',
      loadingMore: 'Načítání...',
      loadMoreError: 'Chyba při načítání',
      loadMore: 'Načíst další příspěvky',
      empty: 'Zatím žádné příspěvky',
    },
  },
} as const

export default courses
