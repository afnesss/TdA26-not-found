const organizationRequestStatus = {
  pageTitle: 'Request status',
  states: {
    loading: 'Loading request status...',
    empty: '—',
  },
  header: {
    title: 'Request status',
    organization: 'Organization',
  },
  statuses: {
    pending: 'Waiting for approval',
    approved: 'Approved',
    rejected: 'Rejected',
  },
  messages: {
    pending:
      'We received the request and it is waiting for review. Once it is processed, the result will appear here.',
    approved:
      'The request was approved. Access details will be or have already been sent manually to the contact email.',
    rejected: 'The request was rejected. The reason is listed below.',
  },
  fields: {
    publicUrl: 'Public URL',
    branchType: 'Branch type',
  },
  approved: {
    title: 'Next steps',
    description:
      'We will send the access details manually to the contact email',
    action: 'Sign in to organization',
  },
  rejected: {
    noteTitle: 'Admin note',
  },
} as const

export default organizationRequestStatus
