import { personaContent } from '@/content/public'

import { PersonaPageTemplate } from './PersonaPageTemplate'

const persona = personaContent.find((item) => item.id === 'success')!

const CustomerSuccessPersonaPage = () => {
  return <PersonaPageTemplate persona={persona} />
}

export default CustomerSuccessPersonaPage
