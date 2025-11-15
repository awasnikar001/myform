import { personaContent } from '@/content/public'

import { PersonaPageTemplate } from './PersonaPageTemplate'

const persona = personaContent.find((item) => item.id === 'operations')!

const OperationsPersonaPage = () => {
  return <PersonaPageTemplate persona={persona} />
}

export default OperationsPersonaPage
