import { IconStarFilled } from '@tabler/icons-react'
import { FC } from 'react'

interface TestimonialCardProps {
  quote: string
  name: string
  role: string
  company: string
  avatar?: string
}

export const TestimonialCard: FC<TestimonialCardProps> = ({
  quote,
  name,
  role,
  company,
  avatar
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
      <div className="mb-4 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <IconStarFilled key={i} className="h-5 w-5 text-yellow-400" />
        ))}
      </div>
      <p className="mb-6 text-slate-300">"{quote}"</p>
      <div className="flex items-center gap-3">
        {avatar ? (
          <img src={avatar} alt={name} className="h-10 w-10 rounded-full" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-sm font-semibold text-white">
            {name.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-semibold text-white">{name}</p>
          <p className="text-sm text-slate-400">
            {role} at {company}
          </p>
        </div>
      </div>
    </div>
  )
}
