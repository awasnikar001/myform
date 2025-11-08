import { FormStatusEnum } from '@heyform-inc/shared-types-enums'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FormService } from '@/services'
import { useParam } from '@/utils'
import { apollo } from '@/utils/apollo'
import { helper } from '@heyform-inc/utils'

import { Async, EmptyState, Repeat } from '@/components'
import { useAppStore } from '@/store'
import { FormType } from '@/types'

import FormItem from './FormItem'

export default function ProjectForms() {
  const { t } = useTranslation()

  const { projectId } = useParam()
  const { openModal } = useAppStore()
  const [forms, setForms] = useState<FormType[]>([])

  async function fetch() {
    const result = await FormService.forms(projectId, FormStatusEnum.NORMAL)

    setForms(result)
    return helper.isValid(result)
  }

  function handleChange(type: string, form: FormType) {
    switch (type) {
      case 'rename':
        setForms(f => f.map(row => (row.id === form.id ? form : row)))
        break

      case 'trash': {
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
        requestAnimationFrame(() => {
          setTimeout(async () => {
            try {
              // Force a fresh fetch with network-only policy (already set in FormService)
              const result = await FormService.forms(projectId, FormStatusEnum.NORMAL)
              if (Array.isArray(result)) {
                setForms(result)
              }
            } catch (error) {
              // If refetch fails, keep the optimistic update
              console.error('Failed to refetch forms after trashing:', error)
            }
          }, 500)
        })
        break
      }

      case 'restore': {
        // Clear Apollo cache for forms query
        try {
          apollo.client.cache.evict({
            fieldName: 'forms'
          })
          apollo.client.cache.gc()
        } catch (e) {
          // Cache eviction failed, continue with refetch
        }

        // If a form is restored from trash, manually refetch to get latest data
        requestAnimationFrame(() => {
          setTimeout(async () => {
            try {
              // Force a fresh fetch with network-only policy
              const result = await FormService.forms(projectId, FormStatusEnum.NORMAL)
              if (Array.isArray(result)) {
                setForms(result)
              }
            } catch (error) {
              console.error('Failed to refetch forms after restore:', error)
            }
          }, 500)
        })
        break
      }

      case 'delete':
        // Form was permanently deleted from trash
        // No action needed here as it shouldn't appear in normal forms list
        break
    }
  }

  return (
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
        <div className="border-accent-light mt-4 flex flex-1 items-center justify-center rounded-lg border border-dashed py-36 shadow-sm">
          <EmptyState
            headline={t('project.forms.headline')}
            subHeadline={t('dashboard.pickTemplate')}
            buttonTitle={t('form.creation.title')}
            onClick={() => openModal('CreateFormModal')}
          />
        </div>
      )}
    >
      <div className="divide-accent-light divide-y [&_:first-of-type]:border-t-0">
        {forms.map(f => (
          <FormItem key={f.id} form={f} onChange={handleChange} />
        ))}
      </div>
    </Async>
  )
}
