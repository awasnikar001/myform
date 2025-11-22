import { IconDatabase, IconForms, IconServer, IconUsers } from '@tabler/icons-react'
import { useRequest } from 'ahooks'
import { useTranslation } from 'react-i18next'

import { WorkspaceService } from '@/services'
import { cn, useParam } from '@/utils'
import { formatBytes } from '@heyform-inc/utils'

import { Skeleton } from '@/components'

export default function Overview() {
  const { t } = useTranslation()

  const { workspaceId } = useParam()

  const { data, loading } = useRequest(
    async () => {
      return WorkspaceService.overview(workspaceId)
    },
    {
      refreshDeps: [workspaceId]
    }
  )

  const STATS_CONFIG = [
    {
      key: 'formCount',
      icon: IconForms,
      label: 'dashboard.forms',
      iconColor: 'text-icon-blue',
      iconBg: 'bg-blue-50/40 dark:bg-blue-950/20 backdrop-blur-md'
    },
    {
      key: 'submissionQuota',
      icon: IconDatabase,
      label: 'dashboard.submission',
      iconColor: 'text-icon-purple',
      iconBg: 'bg-purple-50/40 dark:bg-purple-950/20 backdrop-blur-md'
    },
    {
      key: 'memberCount',
      icon: IconUsers,
      label: 'dashboard.members',
      iconColor: 'text-icon-green',
      iconBg: 'bg-green-50/40 dark:bg-green-950/20 backdrop-blur-md',
      valueTransform: (val: number) => val || 1
    },
    {
      key: 'storageQuota',
      icon: IconServer,
      label: 'dashboard.storage',
      iconColor: 'text-icon-amber',
      iconBg: 'bg-amber-50/40 dark:bg-amber-950/20 backdrop-blur-md',
      valueTransform: formatBytes
    }
  ]

  return (
    <div className="mt-4 grid grid-cols-2 gap-8 xl:grid-cols-4">
      {STATS_CONFIG.map(({ key, icon: Icon, label, iconColor, iconBg, valueTransform }) => (
        <div
          key={key}
          className="group glass-card relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:hover:bg-white/[0.03]"
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-white/50 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110',
                iconBg
              )}
            >
              <Icon className={cn('h-6 w-6', iconColor)} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-secondary text-sm/5 font-medium">{t(label)}</div>
              <Skeleton
                className="mt-1 h-8 [&_[data-slot=skeleton]]:h-7 [&_[data-slot=skeleton]]:w-20"
                loading={loading || !data}
              >
                <div className="text-2xl/8 font-semibold tabular-nums sm:text-xl/8">
                  {valueTransform
                    ? valueTransform((data?.[key as keyof typeof data] as number) ?? 0)
                    : (data?.[key as keyof typeof data] ?? '-')}
                </div>
              </Skeleton>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
