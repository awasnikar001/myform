import { personaContent } from '@/content/public'

import { PersonaPageTemplate } from './PersonaPageTemplate'

const persona = personaContent.find((item) => item.id === 'product')!

const ProductPersonaPage = () => {
  return <PersonaPageTemplate persona={persona} />
}

export default ProductPersonaPage
