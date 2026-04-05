const organizationRequest = {
  pageTitle: 'Create organization',
  title: 'Create organization',
  intro:
    'Send the basic details about your organization. We will prepare the public URL automatically from the organization name.',
  lastRequest: {
    message:
      'You have already submitted a request before and can return to its status.',
    action: 'View last request',
  },
  fields: {
    name: 'Organization name',
    country: 'Country',
    city: 'City',
    postalCode: 'Postal code',
    region: 'Region',
    type: 'Branch type',
    ownerName: 'Owner / contact person',
    contactEmail: 'Contact email',
    address: 'Address',
  },
  footer:
    'Submitting the request starts the approval process for a new organization.',
  actions: {
    submit: 'Submit request',
    submitting: 'Submitting...',
  },
  toast: {
    success: 'Request was received',
  },
} as const

export default organizationRequest
