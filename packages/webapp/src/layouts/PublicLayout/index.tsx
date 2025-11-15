import type { FC } from 'react'

import { Footer, Navbar } from '@/components/marketing'

type IComponentProps = /*unresolved*/ any

export const PublicLayout: FC<IComponentProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-purple-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  )
}
