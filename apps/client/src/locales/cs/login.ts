const login = {
  shell: {
    eyebrow: 'Začněte svou cestu',
    title: {
      underlined: 'Vítejte zpět v',
      highlighted: 'Think Different Academy',
    },
  },
  admin: {
    pageTitle: 'Přihlášení',
    cardTitle: 'Přihlášení správce platformy',
    success: 'Přihlášení úspěšné',
    failure: 'Přihlášení se nepodařilo',
    fields: {
      name: {
        label: 'Jméno',
        required: 'Jméno je povinné',
        placeholder: 'Přihlašovací jméno správce',
      },
      password: {
        label: 'Heslo',
        required: 'Heslo je povinné',
        placeholder: '••••••••',
      },
    },
    actions: {
      submit: 'Přihlásit se',
      showPassword: 'Zobrazit heslo',
      hidePassword: 'Skrýt heslo',
    },
  },
  organization: {
    pageTitle: 'Přihlášení organizace',
    cardTitle: 'Přihlášení',
    success: 'Přihlášení úspěšné',
    failure: 'Nepodařilo se přihlásit',
    roles: {
      lecturer: 'Lektor',
      student: 'Student',
    },
    fields: {
      username: {
        label: 'Uživatelské jméno',
        required: 'Jméno je povinné',
        lecturerPlaceholder: 'Lektor',
        studentPlaceholder: 'Student',
      },
      password: {
        label: 'Heslo',
        required: 'Heslo je povinné',
        placeholder: '••••••••',
      },
    },
    actions: {
      submit: 'Přihlásit se',
      showPassword: 'Zobrazit heslo',
      hidePassword: 'Skrýt heslo',
    },
  },
} as const

export default login
