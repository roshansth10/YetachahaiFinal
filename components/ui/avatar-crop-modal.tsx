'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { ZoomIn, ZoomOut, RotateCcw, X, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface AvatarCropModalProps {
  isOpen: boolean
  imageSrc: string | null
  onClose: () => void
  onSave: (croppedBlob: Blob) => Promise<void>
  isSaving: boolean
}

// Generate cropped 512x512 WebP blob using Canvas (which discards all EXIF metadata)
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = new Image()
  image.src = imageSrc
  await new Promise((resolve, reject) => {
    image.onload = resolve
    image.onerror = reject
  })

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Canvas context not available')
  }

  // Draw only the cropped area resized to exactly 512x512
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    512,
    512
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'))
          return
        }
        resolve(blob)
      },
      'image/webp',
      0.88
    )
  })
}

export default function AvatarCropModal({
  isOpen,
  imageSrc,
  onClose,
  onSave,
  isSaving,
}: AvatarCropModalProps) {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const onCropComplete = useCallback((_croppedArea: Area, currentCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(currentCroppedAreaPixels)
  }, [])

  // Update circular preview whenever crop changes
  useEffect(() => {
    if (!imageSrc || !croppedAreaPixels) return

    let isMounted = true
    const timeout = setTimeout(async () => {
      try {
        const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
        if (isMounted) {
          const url = URL.createObjectURL(blob)
          setPreviewUrl(prev => {
            if (prev) URL.revokeObjectURL(prev)
            return url
          })
        }
      } catch {
        // preview error ignored
      }
    }, 150)

    return () => {
      isMounted = false
      clearTimeout(timeout)
    }
  }, [imageSrc, croppedAreaPixels])

  // Focus trap and ESC key handling
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) {
        onClose()
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSaving, onClose])

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      await onSave(croppedBlob)
    } catch (err) {
      console.error('Failed to crop image:', err)
    }
  }

  if (!isOpen || !imageSrc) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 id="crop-modal-title" className="font-serif text-xl font-bold text-foreground">
              Adjust Profile Picture
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Drag to position, zoom, and crop to a circular photo
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close crop modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-72 sm:h-80 bg-neutral-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            classes={{
              containerClassName: 'rounded-none',
            }}
          />
        </div>

        {/* Zoom Controls & Circular Live Preview */}
        <div className="p-6 space-y-4 bg-card">
          <div className="flex items-center gap-4">
            {/* Live circular preview thumbnail */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-2 border-primary/40 overflow-hidden bg-muted flex items-center justify-center shadow-xs">
                {previewUrl ? (
                  <img src={previewUrl} alt="Circular preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-muted-foreground">Preview</span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1">Preview</span>
            </div>

            {/* Zoom Slider */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-foreground">
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
                  Zoom Level
                </span>
                <span className="font-mono text-muted-foreground">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom(prev => Math.max(1, prev - 0.2))}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                  aria-label="Zoom slider"
                />
                <button
                  type="button"
                  onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setCrop({ x: 0, y: 0 })
                setZoom(1)
              }}
              disabled={isSaving}
              className="min-h-[44px] text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset View
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className="min-h-[44px] px-5 rounded-xl text-sm"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="min-h-[44px] px-6 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    Save Photo
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
