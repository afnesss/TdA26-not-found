import i18n from '@/i18n'
import { colorStyles } from './constants'

type AccentLine = keyof typeof colorStyles.line

type RequestStatus = 'pending' | 'approved' | 'rejected'
type OrganizationStatus = 'waiting' | 'onboarding' | 'active'

type StatusUi = {
  label: string
  line: AccentLine
  badgeClassName: string
}

const requestStatusUi: Record<RequestStatus, Omit<StatusUi, 'label'>> = {
  pending: {
    line: 'primary',
    badgeClassName: 'bg-primary/15 text-primary',
  },
  approved: {
    line: 'secondary',
    badgeClassName: 'bg-secondary/40 text-[#2D8B6B]',
  },
  rejected: {
    line: 'gray',
    badgeClassName: 'bg-muted text-muted-foreground',
  },
}

const organizationStatusUi: Record<
  OrganizationStatus,
  Omit<StatusUi, 'label'>
> = {
  waiting: {
    line: 'gray',
    badgeClassName: 'bg-muted text-muted-foreground',
  },
  onboarding: {
    line: 'primary',
    badgeClassName: 'bg-primary/20 text-primary',
  },
  active: {
    line: 'secondary',
    badgeClassName: 'bg-secondary/46 text-[#2D8B6B]',
  },
}

export const getRequestStatusUi = (status: RequestStatus): StatusUi => ({
  ...requestStatusUi[status],
  label: i18n.t(`statuses.request.${status}`, { ns: 'admin' }),
})

export const getOrganizationStatusUi = (
  status: OrganizationStatus,
): StatusUi => ({
  ...organizationStatusUi[status],
  label: i18n.t(`statuses.organization.${status}`, { ns: 'admin' }),
})

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
