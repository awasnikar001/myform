import { FC } from 'react'

export const LogoCloud: FC = () => {
  // Placeholder logos - in production, these would be actual company logos
  const logos = Array.from({ length: 8 }, (_, i) => i + 1)

  return (
    <section className="border-y border-white/5 bg-black py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-slate-500">
          Trusted by forward-thinking teams
        </p>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-8">
          {logos.map(logo => (
            <div
              key={logo}
              className="group flex h-12 items-center justify-center opacity-40 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0"
            >
              {/* Placeholder Logo */}
              <div className="h-8 w-24 rounded bg-white/10 transition-colors group-hover:bg-white/20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
