import type { FC } from 'react'

import { Footer, Navbar } from '@/components/marketing'

type IComponentProps = /*unresolved*/ any

export const PublicLayout: FC<IComponentProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
