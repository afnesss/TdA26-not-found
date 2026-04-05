const organizationRequestStatus = {
  pageTitle: 'Stav žádosti',
  states: {
    loading: 'Načítám stav žádosti...',
    empty: '—',
  },
  header: {
    title: 'Stav žádosti',
    organization: 'Organizace',
  },
  statuses: {
    pending: 'Čeká na schválení',
    approved: 'Schváleno',
    rejected: 'Zamítnuto',
  },
  messages: {
    pending:
      'Žádost jsme přijali a čeká na kontrolu. Jakmile bude zpracována, objeví se zde výsledek.',
    approved:
      'Žádost byla schválena. Přístupové údaje budou nebo již byly ručně odeslány na kontaktní e-mail.',
    rejected: 'Žádost byla zamítnuta. Níže je uveden důvod zamítnutí.',
  },
  fields: {
    publicUrl: 'Veřejná adresa',
    branchType: 'Typ pobočky',
  },
  approved: {
    title: 'Další postup',
    description:
      'Přístupové údaje odešleme ručně na kontaktní e-mail',
    action: 'Přihlásit se do organizace',
  },
  rejected: {
    noteTitle: 'Poznámka správce',
  },
} as const

export default organizationRequestStatus
