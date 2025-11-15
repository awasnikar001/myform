import { IconDots, IconFolder, IconTag, IconTrash } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { ProjectService } from '@/services'
import { cn, useParam } from '@/utils'

import { Button, Dropdown, Tooltip, usePrompt } from '@/components'
import { useAppStore, useWorkspaceStore } from '@/store'
import { ProjectType } from '@/types'

interface ProjectItemProps {
  project: ProjectType
}

const PROJECT_ACTIONS = [
  {
    label: 'components.rename',
    icon: <IconTag className="h-4 w-4" />,
    value: 'rename'
  },
  {
    label: 'components.delete',
    icon: <IconTrash className="h-4 w-4" />,
    value: 'delete'
  }
]

export default function ProjectItem({ project }: ProjectItemProps) {
  const { t } = useTranslation()

  const prompt = usePrompt()
  const { workspaceId } = useParam()
  const { updateProject } = useWorkspaceStore()
  const { openModal } = useAppStore()

  function handleRename() {
    prompt({
      value: project,
      title: t('project.rename.headline'),
      inputProps: {
        name: 'name',
        label: t('project.rename.name.label'),
        rules: [
          {
            required: true,
            message: t('project.rename.name.required')
          }
        ]
      },
      submitProps: {
        className: '!mt-4 px-5 min-w-24',
        size: 'md',
        label: t('components.save')
      },
      fetch: async values => {
        await ProjectService.rename(project.id, values.name)
        updateProject(workspaceId, project.id, values)
      }
    })
  }

  function handleClick(value: string) {
    switch (value) {
      case 'rename':
        return handleRename()

      case 'delete':
        return openModal('DeleteProjectModal', project)
    }
  }

  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          'group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all hover:bg-slate-100 has-[[data-state=open]]:bg-slate-100 sm:px-2 sm:py-1.5 lg:py-2 dark:hover:bg-slate-700/50 dark:has-[[data-state=open]]:bg-slate-700/50',
          {
            'before:bg-primary relative bg-slate-100 before:absolute before:inset-y-2 before:-left-4 before:w-0.5 before:rounded-full dark:bg-slate-800/50':
              isActive
          }
        )
      }
      to={`/workspace/${workspaceId}/project/${project.id}/`}
    >
      {({ isActive }) => (
        <>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors',
                isActive
                  ? 'bg-slate-200 dark:bg-slate-700/50'
                  : 'group-hover:bg-slate-200 dark:group-hover:bg-slate-700/50'
              )}
            >
              <IconFolder className="h-5 w-5 text-slate-600 dark:text-slate-300" strokeWidth={2} />
            </div>
            <span className="flex-1 truncate">{project.name}</span>
          </div>
          <Dropdown
            contentProps={{
              className: 'min-w-36 [&_[data-value=delete]]:text-error',
              side: 'bottom',
              sideOffset: 8,
              align: 'start'
            }}
            options={PROJECT_ACTIONS}
            multiLanguage
            onClick={handleClick}
          >
            <Button.Link
              className="!h-5 !w-5 rounded opacity-0 group-hover:opacity-100 data-[state=open]:bg-slate-200 data-[state=open]:opacity-100 dark:data-[state=open]:bg-slate-700/50"
              size="sm"
              iconOnly
            >
              <Tooltip label={t('project.menuTip')}>
                <IconDots className="text-secondary h-4 w-4" />
              </Tooltip>
            </Button.Link>
          </Dropdown>
        </>
      )}
    </NavLink>
  )
}
