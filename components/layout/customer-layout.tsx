'use client'

import { type ReactNode } from 'react'
import Navbar from './navbar'
import Footer from './footer'

interface CustomerLayoutProps {
  children: ReactNode
  onNavigate: (page: string, data?: unknown) => void
  hideFooter?: boolean
}

export default function CustomerLayout({ children, onNavigate, hideFooter = false }: CustomerLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onNavigate={onNavigate} />
      <main className="flex-1">
        {children}
      </main>
      {!hideFooter && <Footer onNavigate={onNavigate} />}
    </div>
  )
}
