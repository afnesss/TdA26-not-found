const homepage = {
  hero: {
    eyebrow: 'Učení může být zábava',
    title: {
      underlined: 'Kreativní',
      suffix: ' myšlení s',
    },
    description: {
      prefix:
        'Nezisková organizace pro vzdělávání studentů i veřejnosti. Přinášíme',
      modern: 'moderní',
      connector: 'a',
      interactive: 'interaktivní',
      suffix: 'výuku bez úmorného pročítání textů.',
    },
    helper:
      'Už máte organizaci? Otevřete její vlastní URL nebo požádejte lektora o odkaz či QR kód.',
  },
  actions: {
    createOrganization: 'Založit organizaci',
    browseCourses: 'Procházet kurzy',
    info: 'Info',
  },
  states: {
    loadingOrganization: 'Načítám organizaci...',
  },
} as const

export default homepage
