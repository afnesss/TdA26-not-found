const organizationInfo = {
  pageTitle: {
    fallback: 'Organization info',
    withName: 'Info | {{name}}',
  },
  states: {
    loading: 'Loading organization...',
  },
  hero: {
    title: 'Organization information',
  },
  summary: {
    breadcrumbCurrent: 'Info',
    description:
      'Public organization information, contact details, and a basic overview of its activity.',
  },
  sections: {
    overviewEyebrow: 'Basic overview',
    overviewTitle: 'Organization',
    contactEyebrow: 'Contact',
    contactTitle: 'Contact with the organization',
  },
  fields: {
    name: 'Name',
    type: 'Type',
    address: 'Address',
    contactEmail: 'Contact email',
    contactPerson: 'Contact person',
    organizationUrl: 'Organization URL',
  },
  organizationUrl: {
    description:
      'Courses of this organization are available only through its own space.',
    cta: 'Organization courses overview',
  },
} as const

export default organizationInfo
