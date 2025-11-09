import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FormService } from '@/services'
import { useParam, useRouter } from '@/utils'

import IconAI from '@/assets/ai.svg?react'
import { Button, Form, Input } from '@/components'

import { TemplatesModelProps } from './TemplatesModel'

export default function CreateWithAIModel({ onBack }: TemplatesModelProps) {
  const { t } = useTranslation()

  const router = useRouter()
  const { workspaceId, projectId } = useParam()
  const [rcForm] = Form.useForm()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(true)

  const examples = useMemo(
    () => Array.from({ length: 3 }).map((_, index) => t(`form.ai.topic.examples.${index}`)),
    [t]
  )

  const referenceExamples = useMemo(
    () =>
      Array.from({ length: 3 }).map((_, index) => {
        const translation = t(`form.ai.reference.examples.${index}`)
        // If translation returns the key (translation missing), use fallback
        if (translation === `form.ai.reference.examples.${index}`) {
          return [
            "Include fields for: years of relevant experience, highest education level (High School, Bachelor's, Master's, PhD, or Other), preferred work arrangement (Remote, Hybrid, On-site), availability start date, and salary range expectations. Add a required field for portfolio or GitHub link.",
            'Measure satisfaction across: overall product quality (1-5 Likert scale), delivery time expectations vs. actual, customer support responsiveness, feature usefulness, and Net Promoter Score (0-10). Include an optional open-text field for additional feedback.',
            'Request: full legal name, professional email address, mobile phone number, dietary restrictions/allergies (with options: None, Vegetarian, Vegan, Gluten-free, Nut allergy, Other), emergency contact full name and relationship, and emergency contact phone number.'
          ][index]
        }
        return translation
      }),
    [t]
  )

  async function fetch(values: any) {
    setIsGenerating(true)
    try {
      const formId = await FormService.createWithAI({
        projectId,
        ...values
      })

      router.push(`/workspace/${workspaceId}/project/${projectId}/form/${formId}/create`)
    } catch (error) {
      setIsGenerating(false)
      throw error
    }
  }

  return (
    <div className="sm:w-[42rem]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="-ml-[0.15rem] inline-flex items-center gap-1 text-sm/6"
          onClick={onBack}
        >
          <IconChevronLeft className="h-5 w-5" />
          <span className="font-semibold">{t('form.creation.ai.headline')}</span>
        </button>
      </div>

      <Form.Simple
        className="mt-6 space-y-6"
        form={rcForm}
        submitProps={{
          className: 'px-5 min-w-24',
          size: 'md',
          label: isGenerating ? t('form.ai.generating') : t('form.ai.submit'),
          loading: isGenerating,
          disabled: isGenerating
        }}
        fetch={fetch}
        refreshDeps={[workspaceId, projectId]}
      >
        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <Form.Item
              name="topic"
              label={
                <div className="flex items-center gap-2">
                  <span>{t('form.ai.topic.label')}</span>
                  <span className="text-xs text-red-500">*</span>
                </div>
              }
              description={t('form.ai.topic.description')}
              rules={[
                {
                  required: true,
                  message: t('form.ai.topic.required')
                }
              ]}
            >
              <Input.TextArea
                autoComplete="off"
                maxLength={500}
                showCount
                rows={4}
                className="[&_textarea]:!border-gray-300 [&_textarea]:!bg-white [&_textarea]:!text-gray-900 [&_textarea]:dark:!border-gray-600 [&_textarea]:dark:!bg-gray-900 [&_textarea]:dark:!text-gray-100"
              />
            </Form.Item>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('form.ai.topic.ideasForYou')}
            </p>
            <div className="space-y-2">
              {examples.map((row, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    rcForm.setFieldsValue({ topic: row })
                  }}
                  disabled={isGenerating}
                  className="flex w-full items-start gap-3 rounded-md border border-transparent bg-white p-3 text-left text-sm text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                >
                  <IconAI className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                  <span className="flex-1">{row}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Make reference field collapsible/optional */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('form.ai.reference.label')}
              </span>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {showAdvanced
                  ? 'Hide advanced options'
                  : 'Optional: Add specific requirements or constraints'}
              </p>
            </div>
            <IconChevronRight
              className={`h-5 w-5 text-gray-400 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            />
          </button>

          {showAdvanced && (
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <Form.Item name="reference" description={t('form.ai.reference.description')}>
                <div className="[&_textarea]:!border-gray-300 [&_textarea]:!bg-white [&_textarea]:!text-gray-900 [&_textarea]:dark:!border-gray-600 [&_textarea]:dark:!bg-gray-900 [&_textarea]:dark:!text-gray-100">
                  <Input.TextArea autoComplete="off" rows={4} maxLength={2000} showCount />
                </div>
              </Form.Item>

              <div className="rounded-lg border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 shadow-sm dark:border-blue-700 dark:from-blue-900/30 dark:to-blue-800/20">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 dark:bg-blue-800">
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300">💡</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                    {t('form.ai.reference.examplesTitle') || 'Examples:'}
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  {referenceExamples.map((example, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 rounded-md bg-white/60 px-2 py-1.5 dark:bg-gray-800/40"
                    >
                      <span className="mt-1 text-blue-500 dark:text-blue-400">•</span>
                      <span className="flex-1 leading-relaxed">{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </Form.Simple>
    </div>
  )
}
