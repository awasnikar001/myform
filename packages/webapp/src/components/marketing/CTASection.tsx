import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

export const CTASection: FC = () => {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-blue-600 py-20 lg:py-32">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">
          Ready to Build Better Forms?
        </h2>
        <p className="mb-8 text-xl text-white/90">
          Join thousands of teams already using HeyForm to create beautiful forms and collect
          responses faster.
        </p>
        <button
          onClick={() => navigate('/sign-up')}
          className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-purple-600 transition-all hover:scale-105 hover:shadow-2xl"
        >
          Start Free Trial - No Credit Card Required
        </button>
      </div>
    </section>
  )
}
