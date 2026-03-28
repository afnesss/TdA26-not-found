import { colorStyles } from './constants'

type AccentLine = keyof typeof colorStyles.line

type RequestStatus = 'pending' | 'approved' | 'rejected'
type OrganizationStatus = 'waiting' | 'onboarding' | 'active'

type StatusUi = {
  label: string
  line: AccentLine
  badgeClassName: string
}

const requestStatusUi: Record<RequestStatus, StatusUi> = {
  pending: {
    label: 'Čeká na schválení',
    line: 'primary',
    badgeClassName: 'bg-primary/15 text-primary',
  },
  approved: {
    label: 'Schváleno',
    line: 'secondary',
    badgeClassName: 'bg-secondary/40 text-[#2D8B6B]',
  },
  rejected: {
    label: 'Zamítnuto',
    line: 'gray',
    badgeClassName: 'bg-muted text-muted-foreground',
  },
}

const organizationStatusUi: Record<OrganizationStatus, StatusUi> = {
  waiting: {
    label: 'Čeká',
    line: 'gray',
    badgeClassName: 'bg-muted text-muted-foreground',
  },
  onboarding: {
    label: 'Onboarding',
    line: 'primary',
    badgeClassName: 'bg-primary/15 text-primary',
  },
  active: {
    label: 'Aktivní',
    line: 'secondary',
    badgeClassName: 'bg-secondary/40 text-[#2D8B6B]',
  },
}

export const getRequestStatusUi = (status: RequestStatus) =>
  requestStatusUi[status]

export const getOrganizationStatusUi = (status: OrganizationStatus) =>
  organizationStatusUi[status]

export const getStatusToggleClassName = (
  line: AccentLine,
  isCurrent: boolean,
) => {
  if (!isCurrent) {
    return 'border border-gray-200 bg-background text-primary hover:bg-gray-50'
  }

  switch (line) {
    case 'secondary':
      return 'bg-secondary/45 text-[#2D8B6B] shadow-md'
    case 'primary':
      return 'bg-primary/15 text-primary shadow-md'
    case 'gray':
    default:
      return 'bg-muted text-muted-foreground shadow-sm'
  }
}
