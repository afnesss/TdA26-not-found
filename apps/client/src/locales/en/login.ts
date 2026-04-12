const login = {
  shell: {
    eyebrow: 'Start your journey',
    title: {
      underlined: 'Welcome back to',
      highlighted: 'Think Different Academy',
    },
  },
  admin: {
    pageTitle: 'Sign in',
    cardTitle: 'Platform admin sign in',
    success: 'Sign in successful',
    failure: 'Sign in failed',
    fields: {
      name: {
        label: 'Name',
        required: 'Name is required',
        placeholder: 'Admin username',
      },
      password: {
        label: 'Password',
        required: 'Password is required',
        placeholder: '........',
      },
    },
    actions: {
      submit: 'Sign in',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
    },
  },
  organization: {
    pageTitle: 'Organization sign in',
    cardTitle: 'Sign in',
    success: 'Sign in successful',
    failure: 'Sign in failed',
    roles: {
      lecturer: 'Lecturer',
      student: 'Student',
    },
    hints: {
      studentLogin: 'To create a new account, enter a new username',
    },
    fields: {
      username: {
        label: 'Username',
        required: 'Name is required',
        lecturerPlaceholder: 'Lecturer',
        studentPlaceholder: 'Student',
      },
      password: {
        label: 'Password',
        required: 'Password is required',
        placeholder: '........',
      },
    },
    actions: {
      submit: 'Sign in',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
    },
  },
  organizationPassword: {
    pageTitle: 'Organization password change',
    cardTitle: 'Organization password setup',
    description:
      'First change the temporary organization password. Then you will continue to the dashboard.',
    descriptionWithOrganization:
      'Organization {{organizationName}} is being activated. First change the temporary password and then continue to the dashboard.',
    fields: {
      currentPassword: {
        label: 'Current password',
        required: 'Current password is required',
      },
      newPassword: {
        label: 'New password',
        required: 'New password is required',
        minLength: 'New password must be at least {{count}} characters long',
      },
    },
    actions: {
      showCurrentPassword: 'Show current password',
      hideCurrentPassword: 'Hide current password',
      showNewPassword: 'Show new password',
      hideNewPassword: 'Hide new password',
      submit: 'Save new password',
    },
    toasts: {
      passwordChanged: 'Password changed',
      passwordChangeError: 'Failed to change password',
    },
  },
} as const

export default login
