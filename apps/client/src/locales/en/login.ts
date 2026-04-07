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
    toasts: {
      passwordChanged: 'Password changed',
      passwordChangeError: 'Failed to change password',
    },
  },
} as const

export default login
