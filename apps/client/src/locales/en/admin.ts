const admin = {
  organizations: {
    pageTitle: 'Organizations',
    heading: 'Organizations',
    loading: 'Loading organizations...',
    empty: 'There are no organizations here yet',
    createdAt: 'Created',
    deleteItemType: 'organization',
    deleteAriaLabel: 'Delete organization {{name}}',
    toasts: {
      statusUpdated: 'Organization status changed to {{status}}',
      statusUpdateError: 'Failed to change organization status',
      deleted: 'Organization deleted',
      deleteError: 'Failed to delete organization',
    },
  },
  requests: {
    pageTitle: 'Organization requests',
    heading: 'Organization requests',
    loading: 'Loading requests...',
    empty: 'There are no organization requests here yet',
    adminNoteLabel: 'Admin note',
    adminNotePlaceholder: 'Note for approval or reason for rejection',
    createdAt: 'Created:',
    actions: {
      reject: 'Reject',
      approve: 'Approve',
    },
    validation: {
      rejectNoteRequired: 'Enter an admin note before rejecting.',
    },
    toasts: {
      approved: 'Request approved',
      approveError: 'Failed to approve request',
      rejected: 'Request rejected',
      rejectError: 'Failed to reject request',
    },
  },
  statuses: {
    request: {
      pending: 'Waiting for approval',
      approved: 'Approved',
      rejected: 'Rejected',
    },
    organization: {
      waiting: 'Waiting',
      onboarding: 'Onboarding',
      active: 'Active',
    },
  },
} as const

export default admin
