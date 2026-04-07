const courses = {
  pageTitle: 'Courses',
  organizationPageTitle: 'Organization courses',
  heading: 'Available courses',
  searchPlaceholder: 'Search courses...',
  filterAriaLabel: 'Filter courses',
  sorting: {
    newest: 'Newest',
    oldest: 'Oldest',
  },
  statuses: {
    live: 'Active',
    planned: 'Planned',
    paused: 'Paused',
  },
  empty: {
    noCourses: 'No courses to display',
  },
  actions: {
    resetFilters: 'Reset filters',
    loadMore: 'Load more courses',
  },
} as const

export default courses
