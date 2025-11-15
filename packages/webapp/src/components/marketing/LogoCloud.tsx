import { FC } from 'react'

export const LogoCloud: FC = () => {
  // Placeholder logos - in production, these would be actual company logos
  const logos = Array.from({ length: 9 }, (_, i) => i + 1)

  return (
    <section className="border-y border-slate-800 bg-slate-950 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-sm font-medium text-slate-400">
          Trusted by companies at:
        </p>
        <div className="grid grid-cols-3 gap-8 md:grid-cols-6 lg:grid-cols-9">
          {logos.map(logo => (
            <div
              key={logo}
              className="flex h-12 items-center justify-center opacity-70 grayscale transition-opacity hover:opacity-100"
            >
              <div className="h-8 w-24 rounded bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
