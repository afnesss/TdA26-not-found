const homepage = {
  hero: {
    eyebrow: 'Learning can be fun',
    title: {
      underlined: 'Creative',
      suffix: ' thinking with',
    },
    description: {
      prefix:
        'A non-profit organization for educating students and the public. We bring',
      modern: 'modern',
      connector: 'and',
      interactive: 'interactive',
      suffix: 'learning without tedious text reading.',
    },
    helper:
      'Already have an organization? Open its own URL or ask a lecturer for a link or QR code.',
  },
  actions: {
    createOrganization: 'Create organization',
    browseCourses: 'Browse courses',
    info: 'Info',
  },
  states: {
    loadingOrganization: 'Loading organization...',
  },
} as const

export default homepage
