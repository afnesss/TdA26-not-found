const admin = {
  organizations: {
    pageTitle: 'Organizace',
    heading: 'Organizace',
    loading: 'Načítám organizace...',
    empty: 'Zatím zde nejsou žádné organizace',
    createdAt: 'Vytvořeno',
    deleteItemType: 'organizaci',
    deleteAriaLabel: 'Smazat organizaci {{name}}',
    toasts: {
      statusUpdated: 'Stav organizace byl změněn na {{status}}',
      statusUpdateError: 'Stav organizace se nepodařilo změnit',
      deleted: 'Organizace byla smazána',
      deleteError: 'Organizaci se nepodařilo smazat',
    },
  },
  requests: {
    pageTitle: 'Žádosti organizací',
    heading: 'Žádosti organizací',
    loading: 'Načítám žádosti...',
    empty: 'Zatím zde nejsou žádné žádosti organizací',
    adminNoteLabel: 'Poznámka správce',
    adminNotePlaceholder: 'Poznámka pro schválení nebo důvod zamítnutí',
    createdAt: 'Vytvořeno:',
    actions: {
      reject: 'Zamítnout',
      approve: 'Schválit',
    },
    validation: {
      rejectNoteRequired: 'Pro zamítnutí nejdřív vyplňte poznámku.',
    },
    toasts: {
      approved: 'Žádost byla schválena',
      approveError: 'Žádost se nepodařilo schválit',
      rejected: 'Žádost byla zamítnuta',
      rejectError: 'Žádost se nepodařilo zamítnout',
    },
  },
  statuses: {
    request: {
      pending: 'Čeká na schválení',
      approved: 'Schváleno',
      rejected: 'Zamítnuto',
    },
    organization: {
      waiting: 'Čeká',
      onboarding: 'Onboarding',
      active: 'Aktivní',
    },
  },
} as const

export default admin
