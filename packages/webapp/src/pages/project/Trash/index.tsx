import { FormStatusEnum } from '@heyform-inc/shared-types-enums'
import { IconArrowUpRight } from '@tabler/icons-react'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { FormService } from '@/services'
import { useParam } from '@/utils'
import { apollo } from '@/utils/apollo'
import { helper } from '@heyform-inc/utils'

import { Async, EmptyState, Repeat } from '@/components'
import { FormType } from '@/types'

import FormItem from '../Forms/FormItem'

export default function ProjectTrash() {
  const { t } = useTranslation()

  const { projectId } = useParam()
  const [forms, setForms] = useState<FormType[]>([])

  async function fetch() {
    const result = await FormService.forms(projectId, FormStatusEnum.TRASH)

    setForms(result)
    return helper.isValid(result)
  }

  function handleChange(type: string, form: FormType) {
    if (type === 'delete' || type === 'restore') {
      // Optimistically update UI immediately
      const updatedForms = forms.filter(row => row.id !== form.id)
      setForms(updatedForms)

      // Clear Apollo cache for forms query to ensure fresh data
      try {
        apollo.client.cache.evict({
          fieldName: 'forms'
        })
        apollo.client.cache.gc()
      } catch (e) {
        // Cache eviction failed, continue with refetch
      }

      // Manually refetch to ensure we have latest data from server
      // Use requestAnimationFrame + setTimeout to ensure DOM updates and mutation completion
      requestAnimationFrame(() => {
        setTimeout(async () => {
          try {
            // Force a fresh fetch with network-only policy (already set in FormService)
            const result = await FormService.forms(projectId, FormStatusEnum.TRASH)
            if (Array.isArray(result)) {
              setForms(result)
            }
          } catch (error) {
            // If refetch fails, revert to optimistic update
            console.error('Failed to refetch forms after deletion:', error)
            // Keep the optimistic update
          }
        }, 500)
      })
    }
  }

  return (
    <>
      <p className="text-secondary my-4 text-sm">
        <Trans
          t={t}
          i18nKey="project.trash.tip"
          components={{
            a: (
              <a
                className="hover:text-primary underline underline-offset-4"
                href="https://docs.heyform.net/quickstart/how-to-retrieve-forms-from-trash"
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
            icon: <IconArrowUpRight className="inline h-4 w-4" stroke={1.5} />
          }}
        />
      </p>

      <Async
        fetch={fetch}
        refreshDeps={[projectId]}
        loader={
          <div className="divide-accent-light divide-y [&_:first-of-type]:border-t-0">
            <Repeat count={3}>
              <FormItem.Skeleton />
            </Repeat>
          </div>
        }
        emptyRender={() => (
          <div className="border-accent-light flex flex-1 items-center justify-center rounded-lg border border-dashed py-36 shadow-sm">
            <EmptyState
              headline={t('project.trash.headline')}
              subHeadline={t('project.trash.subHeadline')}
            />
          </div>
        )}
      >
        <div className="divide-accent-light divide-y [&_:first-of-type]:border-t-0">
          {forms.map(f => (
            <FormItem key={f.id} form={f} isInTrash onChange={handleChange} />
          ))}
        </div>
      </Async>
    </>
  )
}
