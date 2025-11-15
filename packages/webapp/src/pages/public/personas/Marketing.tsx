import { personaContent } from '@/content/public'

import { PersonaPageTemplate } from './PersonaPageTemplate'

const persona = personaContent.find((item) => item.id === 'marketing')!

const MarketingPersonaPage = () => {
  return <PersonaPageTemplate persona={persona} />
}

export default MarketingPersonaPage
