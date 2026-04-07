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
  userCourse: {
    breadcrumbRoot: 'Courses',
    titleFallback: 'Course',
    leaderboardTitle: 'Student leaderboard',
    activeModulesTitle: 'Active modules',
    noActiveModules: 'This course has no active modules yet',
    moduleTitleFallback: '{{courseName}} - module',
    moduleNotFound: 'Module not found',
    materialsTitle: 'Study materials',
    noMaterials: 'No materials yet',
    quizzesTitle: 'Quizzes',
    noQuizzes: 'No quizzes yet',
  },
} as const

export default courses
