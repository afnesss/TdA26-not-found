const organizationRequest = {
  pageTitle: 'Založit organizaci',
  title: 'Založit si organizaci',
  intro:
    'Pošlete základní údaje o vaší organizaci. Název veřejné adresy připravíme automaticky podle názvu organizace.',
  lastRequest: {
    message:
      'Už jste dříve odeslali žádost a můžete se vrátit k jejímu stavu.',
    action: 'Zobrazit poslední žádost',
  },
  fields: {
    name: 'Název organizace',
    country: 'Země',
    city: 'Město',
    postalCode: 'PSČ',
    region: 'Region',
    type: 'Typ pobočky',
    ownerName: 'Vedoucí / kontaktní osoba',
    contactEmail: 'Kontaktní e-mail',
    address: 'Adresa',
  },
  footer:
    'Odesláním žádosti zahájíte schvalovací proces nové organizace.',
  actions: {
    submit: 'Odeslat žádost',
    submitting: 'Odesílám...',
  },
  toast: {
    success: 'Žádost byla přijata',
  },
} as const

export default organizationRequest
