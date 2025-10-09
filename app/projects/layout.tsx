import { ReactNode } from 'react'

interface ProjectsLayoutProps {
  children: ReactNode
  modal: ReactNode
}

export default function ProjectsLayout({ children, modal }: ProjectsLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}

