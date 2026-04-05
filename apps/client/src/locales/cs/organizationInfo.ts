const organizationInfo = {
  pageTitle: {
    fallback: 'Info organizace',
    withName: 'Info | {{name}}',
  },
  states: {
    loading: 'Načítám organizaci...',
  },
  hero: {
    title: 'Informace o organizaci',
  },
  summary: {
    breadcrumbCurrent: 'Info',
    description:
      'Veřejné informace o organizaci, kontaktní údaje a základní přehled jejího působení.',
  },
  sections: {
    overviewEyebrow: 'Základní přehled',
    overviewTitle: 'Organizace',
    contactEyebrow: 'Kontakt',
    contactTitle: 'Spojení s organizací',
  },
  fields: {
    name: 'Název',
    type: 'Typ',
    address: 'Adresa',
    contactEmail: 'Kontaktní e-mail',
    contactPerson: 'Kontaktní osoba',
    organizationUrl: 'URL organizace',
  },
  organizationUrl: {
    description:
      'Kurzy této organizace jsou dostupné pouze přes její vlastní prostor.',
    cta: 'Přehled kurzů organizace',
  },
} as const

export default organizationInfo
