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
    failure: 'Přihlášení se nezdařilo',
    fields: {
      name: {
        label: 'Jméno',
        required: 'Jméno je povinné',
        placeholder: 'Přihlašovací jméno správce',
      },
      password: {
        label: 'Heslo',
        required: 'Heslo je povinné',
        placeholder: '........',
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
    hints: {
      studentLogin: 'Pro vytvoření nového učtu zadejte nové uživatelské jméno.',
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
        placeholder: '........',
      },
    },
    actions: {
      submit: 'Přihlásit se',
      showPassword: 'Zobrazit heslo',
      hidePassword: 'Skrýt heslo',
    },
  },
  organizationPassword: {
    pageTitle: 'Změna hesla organizace',
    cardTitle: 'Nastavení hesla organizace',
    description:
      'Nejprve změňte dočasné heslo organizace. Poté budete pokračovat do dashboardu.',
    descriptionWithOrganization:
      'Organizace {{organizationName}} se právě aktivuje. Nejprve změňte dočasné heslo a poté budete pokračovat do dashboardu.',
    fields: {
      currentPassword: {
        label: 'Současné heslo',
        required: 'Současné heslo je povinné',
      },
      newPassword: {
        label: 'Nové heslo',
        required: 'Nové heslo je povinné',
        minLength: 'Nové heslo musí mít alespoň {{count}} znaků',
      },
    },
    actions: {
      showCurrentPassword: 'Zobrazit současné heslo',
      hideCurrentPassword: 'Skrýt současné heslo',
      showNewPassword: 'Zobrazit nové heslo',
      hideNewPassword: 'Skrýt nové heslo',
      submit: 'Uložit nové heslo',
    },
    toasts: {
      passwordChanged: 'Heslo bylo změněno',
      passwordChangeError: 'Nepodařilo se změnit heslo',
    },
  },
} as const

export default login
