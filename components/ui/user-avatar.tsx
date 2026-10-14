'use client'

import React from 'react'

interface UserAvatarProps {
  user?: {
    name?: string
    avatar?: string | null
  } | null
  name?: string
  avatar?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
}

// Stable muted brand color palettes matching Yetaxahai (terracotta, sage, ochre, slate, plum)
const BRAND_PALETTES = [
  { bg: '#faece6', text: '#9c4327', border: '#eecbc0' }, // Terracotta
  { bg: '#edf2ec', text: '#3f5237', border: '#c7d6c5' }, // Sage
  { bg: '#faf3e6', text: '#8a5815', border: '#ebd8b7' }, // Warm Ochre
  { bg: '#eaf0f2', text: '#324e56', border: '#c4d7dc' }, // Slate Teal
  { bg: '#f5ecee', text: '#5e353d', border: '#dfc5cb' }, // Muted Plum
  { bg: '#f0ece7', text: '#5e4e3e', border: '#d9cfc4' }, // Warm Sand
]

function getStablePalette(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % BRAND_PALETTES.length
  return BRAND_PALETTES[index]
}

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm font-medium',
  lg: 'w-12 h-12 text-base font-medium',
  xl: 'w-20 h-20 text-2xl font-serif font-bold',
  '2xl': 'w-28 h-28 text-3xl font-serif font-bold',
}

export default function UserAvatar({
  user,
  name: explicitName,
  avatar: explicitAvatar,
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const name = explicitName || user?.name || 'Reader'
  const avatar = explicitAvatar !== undefined ? explicitAvatar : user?.avatar
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md
  const palette = getStablePalette(name)
  const initials = getInitials(name)

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={`Profile picture of ${name}`}
        className={`rounded-full object-cover shrink-0 border border-primary/20 ${sizeClass} ${className}`}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={`Avatar for ${name} (${initials})`}
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
        borderColor: palette.border,
      }}
      className={`rounded-full flex items-center justify-center shrink-0 border select-none transition-colors ${sizeClass} ${className}`}
    >
      <span>{initials}</span>
    </div>
  )
}
