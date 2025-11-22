import { Content, Description, Overlay, Portal, Root, Title } from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  IconHelp,
  IconHome,
  IconLocation,
  IconPlus,
  IconSearch,
  IconSettings,
  IconStack2,
  IconUsers
} from '@tabler/icons-react'
import { FC, ForwardRefExoticComponent } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { cn, useParam } from '@/utils'
import { helper } from '@heyform-inc/utils'

import { Button, Tooltip } from '@/components'
import { HELP_CENTER_URL, TEMPLATES_URL } from '@/consts'
import { useAppStore, useModal, useWorkspaceStore } from '@/store'

import ChangelogButton from './ChangelogButton'
import ProjectItem from './ProjectItem'
import WorkspaceAccount from './WorkspaceAccount'
import WorkspaceSwitcher from './WorkspaceSwitcher'

interface LinkProps {
  to: string
  icon: ForwardRefExoticComponent<any>
  label: string
}

const RESOURCE_LINKS = [
  {
    icon: IconLocation,
    title: 'workspace.sidebar.gettingStarted',
    href: `${HELP_CENTER_URL}/quickstart/create-a-form`
  },
  {
    icon: IconHelp,
    title: 'workspace.sidebar.help',
    href: HELP_CENTER_URL
  },
  {
    icon: IconStack2,
    title: 'workspace.sidebar.template',
    href: TEMPLATES_URL
  }
]

const Link: FC<LinkProps> = ({ to, icon: Icon, label }) => {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all hover:bg-slate-100 sm:px-2 sm:py-1.5 lg:py-2 dark:hover:bg-slate-700/50',
          {
            'text-primary before:bg-primary relative bg-slate-100 before:absolute before:inset-y-2 before:-left-4 before:w-0.5 before:rounded-full dark:bg-slate-800/50':
              isActive
          }
        )
      }
      to={to}
      end
    >
      {({ isActive }) => (
        <>
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors',
              isActive
                ? 'bg-slate-200 dark:bg-slate-700/50'
                : 'group-hover:bg-slate-200 dark:group-hover:bg-slate-700/50'
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5 transition-colors',
                isActive ? 'stroke-primary' : 'stroke-secondary group-hover:stroke-primary'
              )}
              data-slot="icon"
            />
          </div>
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  )
}

const WorkspaceSidebarComponent = () => {
  const { t } = useTranslation()

  const { workspaceId } = useParam()
  const { openModal } = useAppStore()
  const { workspace } = useWorkspaceStore()

  return (
    <div className="max-lg:bg-background flex h-full flex-col max-lg:rounded-lg">
      <div className="border-accent-light border-b p-4">
        <WorkspaceSwitcher />
      </div>

      <div className="scrollbar flex flex-1 flex-col p-4">
        <nav className="flex flex-col gap-y-0.5">
          {/* Home */}
          <Link to={`/workspace/${workspaceId}/`} icon={IconHome} label={t('dashboard.title')} />

          {/* Search */}
          <button
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all hover:bg-slate-100 sm:px-2 sm:py-1.5 lg:py-2 dark:hover:bg-slate-700/50"
            onClick={() => openModal('SearchModal')}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors group-hover:bg-slate-200 dark:group-hover:bg-slate-700/50">
              <IconSearch
                className="stroke-secondary group-hover:stroke-primary h-5 w-5 transition-colors"
                data-slot="icon"
              />
            </div>
            <span className="text-primary truncate">{t('workspace.sidebar.search')}</span>
          </button>

          {/* Members */}
          <Link
            to={`/workspace/${workspaceId}/members`}
            icon={IconUsers}
            label={t('members.title')}
          />

          {workspace.isOwner && (
            <>
              {/* Settings */}
              <Link
                to={`/workspace/${workspaceId}/settings`}
                icon={IconSettings}
                label={t('settings.title')}
              />
            </>
          )}
        </nav>

        <div className="group/projects mt-8 flex flex-col gap-0.5">
          <div className="text-secondary mb-1 flex items-center justify-between px-2 text-xs/6 font-medium">
            <h3>{t('workspace.sidebar.projects')}</h3>
            <Tooltip label={t('project.creation.title')}>
              <Button.Link
                className={cn(
                  'text-secondary -mr-1 !h-6 !w-6 rounded opacity-0 group-hover/projects:opacity-100',
                  {
                    'opacity-100': helper.isEmpty(workspace?.projects)
                  }
                )}
                size="sm"
                iconOnly
                onClick={() => openModal('CreateProjectModal')}
              >
                <IconPlus className="h-5 w-5" />
              </Button.Link>
            </Tooltip>
          </div>

          {helper.isValidArray(workspace?.projects) ? (
            <nav>
              {workspace!.projects.map(p => (
                <ProjectItem key={p.id} project={p} />
              ))}
            </nav>
          ) : (
            <div className="px-3 sm:px-2">
              <div className="border-accent-light text-secondary rounded-lg border border-dashed p-2 text-xs shadow-sm">
                {t('workspace.sidebar.noProjects')}
              </div>
            </div>
          )}
        </div>

        <div aria-hidden="true" className="mt-8 flex-1"></div>

        <nav className="mt-8">
          {RESOURCE_LINKS.map(row => (
            <a
              key={row.title}
              href={row.href}
              target="_blank"
              rel="noreferrer"
              className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-sm font-medium transition-all hover:bg-slate-100 sm:px-1.5 sm:py-1.5 lg:py-2 dark:hover:bg-slate-700/50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors group-hover:bg-slate-200 dark:group-hover:bg-slate-700/50">
                <row.icon className="stroke-secondary group-hover:stroke-primary h-5 w-5 transition-colors" />
              </div>
              <span className="text-primary truncate">{t(row.title)}</span>
            </a>
          ))}

          {/* Changelog */}
          <ChangelogButton />
        </nav>
      </div>

      <WorkspaceAccount containerClassName="max-lg:hidden" />
    </div>
  )
}

export const WorkspaceSidebarModal = () => {
  const { isOpen, onOpenChange } = useModal('WorkspaceSidebarModal')

  return (
    <Root open={isOpen} onOpenChange={onOpenChange}>
      <Portal>
        <Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-10 bg-black/60" />
        <Content className="border-accent-light bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-left-0 data-[state=open]:slide-in-from-left-[80%] fixed bottom-2 left-2 top-2 z-10 w-72 rounded-lg border shadow-lg duration-200">
          <Title>
            <VisuallyHidden />
          </Title>
          <Description>
            <VisuallyHidden />
          </Description>
          <WorkspaceSidebarComponent />
        </Content>
      </Portal>
    </Root>
  )
}

const WorkspaceSidebar = () => {
  return (
    <div
      className="bg-background fixed inset-y-0 left-0 z-20 w-64 transition-transform duration-300 max-lg:hidden"
      data-slot="layout-sidebar"
    >
      <WorkspaceSidebarComponent />
    </div>
  )
}

export default WorkspaceSidebar
