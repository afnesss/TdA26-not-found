const dashboard = {
  pageTitle: 'Course management',
  headings: {
    content: 'Course management',
    analytics: 'Course statistics',
  },
  searchPlaceholder: 'Search courses...',
  filterAriaLabel: 'Filter courses',
  filterTriggerLabel: 'Filters',
  sorting: {
    newest: 'Newest',
    oldest: 'Oldest',
  },
  statuses: {
    draft: 'Drafts',
    planned: 'Planned',
    live: 'Active',
    paused: 'Paused',
    archived: 'Archive',
  },
  backup: {
    triggerLabel: 'Export / import',
    triggerAriaLabel: 'Course backups',
    menuLabel: 'Export and import',
    exportLabel: 'Export all',
    importLabel: 'Import courses',
    invalidJsonMessage: 'Select a JSON backup',
    duplicateCourseMessage: 'Course with ID {{courseId}} already exists',
    exportSuccessMessage: 'All courses were exported',
    exportErrorMessage: 'Failed to export all courses',
  },
  tabs: {
    content: 'Content',
    statistics: 'Statistics',
  },
  mobileActions: {
    open: 'Open more',
    close: 'Close more',
  },
  buttons: {
    createCourse: 'Create course',
    loadMore: 'Load more courses',
  },
  states: {
    createFirstCourse: 'Start by creating your first course',
    loadError: 'Failed to load courses',
  },
  actions: {
    resetFilters: 'Reset filters',
  },
} as const

export default dashboard
