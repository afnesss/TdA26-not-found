const login = {
  shell: {
    eyebrow: 'Zacnete svou cestu',
    title: {
      underlined: 'Vitejte zpet v',
      highlighted: 'Think Different Academy',
    },
  },
  admin: {
    pageTitle: 'Prihlaseni',
    cardTitle: 'Prihlaseni spravce platformy',
    success: 'Prihlaseni uspesne',
    failure: 'Prihlaseni se nezdarilo',
    fields: {
      name: {
        label: 'Jmeno',
        required: 'Jmeno je povinne',
        placeholder: 'Prihlasovaci jmeno spravce',
      },
      password: {
        label: 'Heslo',
        required: 'Heslo je povinne',
        placeholder: '........',
      },
    },
    actions: {
      submit: 'Prihlasit se',
      showPassword: 'Zobrazit heslo',
      hidePassword: 'Skryt heslo',
    },
  },
  organization: {
    pageTitle: 'Prihlaseni organizace',
    cardTitle: 'Prihlaseni',
    success: 'Prihlaseni uspesne',
    failure: 'Nepodarilo se prihlasit',
    roles: {
      lecturer: 'Lektor',
      student: 'Student',
    },
    fields: {
      username: {
        label: 'Uzivatelske jmeno',
        required: 'Jmeno je povinne',
        lecturerPlaceholder: 'Lektor',
        studentPlaceholder: 'Student',
      },
      password: {
        label: 'Heslo',
        required: 'Heslo je povinne',
        placeholder: '........',
      },
    },
    actions: {
      submit: 'Prihlasit se',
      showPassword: 'Zobrazit heslo',
      hidePassword: 'Skryt heslo',
    },
  },
  organizationPassword: {
    toasts: {
      passwordChanged: 'Heslo bylo zmeneno',
      passwordChangeError: 'Nepodarilo se zmenit heslo',
    },
  },
} as const

export default login
