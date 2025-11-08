import { IconChevronLeft } from '@tabler/icons-react'
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
            "Include questions about: work experience (years), education level (High School, Bachelor's, Master's, PhD), preferred work location (Remote, Hybrid, On-site), and salary expectations.",
            'The survey should cover: product quality (1-5 scale), delivery time satisfaction, customer service rating, and likelihood to recommend (0-10).',
            'Collect: full name, email, phone number, dietary restrictions (Vegetarian, Vegan, Gluten-free, None), emergency contact name and phone.'
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
              maxLength={200}
              showCount
              placeholder="e.g., Create a job application form to collect candidate details and resumes"
              rows={3}
            />
          </Form.Item>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('form.ai.topic.ideasForYou')}
            </p>
            <ul className="mt-2 space-y-1">
              {examples.map((row, index) => (
                <li key={index}>
                  <Button.Link
                    className="!h-auto w-full px-2 py-2 text-left text-sm [&_[data-slot=button]]:items-center [&_[data-slot=button]]:justify-start"
                    onClick={() => rcForm.setFieldValue('topic', row)}
                    disabled={isGenerating}
                  >
                    <IconAI className="h-4 w-4 text-blue-500" />
                    <span className="ml-2">{row}</span>
                  </Button.Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <Form.Item
            name="reference"
            label={
              <div className="flex items-center gap-2">
                <span>{t('form.ai.reference.label')}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">(Optional)</span>
              </div>
            }
            description={
              <div className="space-y-1">
                <p>{t('form.ai.reference.description')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('form.ai.reference.hint')}
                </p>
              </div>
            }
          >
            <Input.TextArea
              autoComplete="off"
              rows={6}
              maxLength={2000}
              showCount
              placeholder="e.g., Include specific questions about work experience, education level, and preferred work location. Options for work location should be: Remote, Hybrid, On-site only."
            />
          </Form.Item>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
            <p className="mb-2 text-sm font-medium text-blue-700 dark:text-blue-300">
              💡 {t('form.ai.reference.examplesTitle')}
            </p>
            <ul className="space-y-2 text-xs text-blue-600 dark:text-blue-400">
              {referenceExamples.map((example, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Form.Simple>
    </div>
  )
}
