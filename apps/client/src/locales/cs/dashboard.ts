const dashboard = {
  pageTitle: 'Správa kurzů',
  headings: {
    content: 'Správa kurzů',
    analytics: 'Statistiky kurzů',
  },
  searchPlaceholder: 'Vyhledat kurz...',
  filterAriaLabel: 'Filtrovat kurzy',
  filterTriggerLabel: 'Filtry',
  sorting: {
    newest: 'Nejnovější',
    oldest: 'Nejstarší',
  },
  statuses: {
    draft: 'Návrhy',
    planned: 'Naplánované',
    live: 'Aktivní',
    paused: 'Pozastavené',
    archived: 'Archiv',
  },
  backup: {
    triggerLabel: 'Export / import',
    triggerAriaLabel: 'Zálohy kurzů',
    menuLabel: 'Export a import',
    exportLabel: 'Exportovat vše',
    importLabel: 'Importovat kurzy',
    invalidJsonMessage: 'Vyber JSON zálohu',
    duplicateCourseMessage: 'Kurz s ID {{courseId}} už existuje',
    exportSuccessMessage: 'Všechny kurzy byly exportovány',
    exportErrorMessage: 'Nepodařilo se exportovat všechny kurzy',
  },
  tabs: {
    content: 'Obsah',
    statistics: 'Statistiky',
  },
  mobileActions: {
    open: 'Otevřít další',
    close: 'Zavřít další',
  },
  buttons: {
    createCourse: 'Vytvořit kurz',
    loadMore: 'Načíst další kurzy',
  },
  states: {
    createFirstCourse: 'Začněte vytvořením svého prvního kurzu',
    loadError: 'Nepodařilo se načíst kurzy',
  },
  actions: {
    resetFilters: 'Zrušit filtry',
  },
} as const

export default dashboard
