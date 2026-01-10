import { Label } from '@/components/ui/label'
import type { Material } from '@/lib/schemas'
import { cn, formatFileSize, getFileIcon } from '@/lib/utils'
import {
  Download,
  Edit,
  ExternalLink,
  Copy,
  Check,
  X,
  Upload,
  FileUp,
  Link2,
} from 'lucide-react'
import { useState, useRef } from 'react'
import EditBtn from '../../pages/dashboard/components/EditBtn'
import { Textarea } from '../ui/textarea'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type MaterialCardProps =
  | {
      material: Material
      type: 'classic'
    }
  | {
      material: Material
      type: 'edit'
      isDraft?: true
      onCancel?: () => void
      onSave?: (data: {
        type: 'file' | 'url'
        name?: string
        description?: string
        file?: File
        url?: string
      }) => Promise<void>
      onDelete?: () => void
    }

const MaterialIcon = ({
  material,
  className,
}: {
  material: Material
  className?: string
}) => {
  return (
    <div className={cn('rounded-lg shrink-0 text-xl', className)}>
      {material.type === 'file' ? (
        getFileIcon(material.mimeType ?? 'application/pdf')
      ) : material.faviconUrl ? (
        <img
          src={material.faviconUrl}
          alt=''
          className='w-4 h-4 md:w-6 md:h-6 rounded'
          loading='lazy'
          referrerPolicy='no-referrer'
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
      ) : (
        '🔗'
      )}
    </div>
  )
}

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const MaterialCard = (props: MaterialCardProps) => {
  const { material, type } = props
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [state, setState] = useState({
    isEditing: type === 'edit' && 'isDraft' in props ? props.isDraft : false,
    tempName: '',
    tempDescription: '',
    tempUrl: '',
    tempFile: null as File | null,
    tempType: material.type,
    nameError: '',
    urlError: '',
    copied: false,
    saving: false,
  })

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setState((prev) => ({ ...prev, copied: true }))
      toast.success('Odkaz zkopírován')
      setTimeout(() => setState((prev) => ({ ...prev, copied: false })), 1500)
    } catch (err) {
      toast.error('Nepodařilo se zkopírovat')
    }
  }
  const handleTypeChange = (newType: 'file' | 'url') => {
    console.log(material.type)
    setState((prev) => ({
      ...prev,
      tempType: newType,
      tempFile: null,
      tempUrl: '',
      urlError: '',
    }))
  }

  const startEdit = () => {
    setState({
      isEditing: true,
      tempName: material.name,
      tempDescription: material.description || '',
      tempUrl: material.type === 'url' ? material.url : '',
      tempFile: null,
      tempType: material.type,
      nameError: '',
      urlError: '',
      copied: false,
      saving: false,
    })
  }

  const cancelEdit = () => {
    if (
      type === 'edit' &&
      'isDraft' in props &&
      props.isDraft &&
      props.onCancel
    ) {
      props.onCancel()
    } else {
      setState({
        isEditing: false,
        tempName: '',
        tempDescription: '',
        tempUrl: '',
        tempType: material.type,
        tempFile: null,
        nameError: '',
        urlError: '',
        copied: false,
        saving: false,
      })
    }
  }

  const handleNameChange = (name: string) => {
    setState((prev) => ({
      ...prev,
      tempName: name,
      nameError: !name.trim() ? 'Název je povinný' : '',
    }))
  }

  const handleUrlChange = (url: string) => {
    setState((prev) => ({
      ...prev,
      tempUrl: url,
      urlError: url.trim() && !isValidUrl(url) ? 'Neplatný formát URL' : '',
    }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setState((prev) => ({ ...prev, tempFile: file }))
    }
  }

  const saveEdit = async () => {
    if (!state.tempName.trim()) {
      setState((prev) => ({ ...prev, nameError: 'Název je povinný' }))
      return
    }

    if (material.type === 'url' && state.tempUrl !== material.url) {
      if (!state.tempUrl.trim()) {
        setState((prev) => ({ ...prev, urlError: 'URL nemůže být prázdné' }))
        return
      }
      if (!isValidUrl(state.tempUrl)) {
        setState((prev) => ({ ...prev, urlError: 'Neplatný formát URL' }))
        return
      }
    }
    if ('isDraft' in props && props.isDraft) {
      if (state.tempType === 'file' && !state.tempFile) {
        toast.error('Vyberte soubor')
        return
      }
      if (state.tempType === 'url' && !state.tempUrl) {
        toast.error('Vyberte odkaz')
        return
      }
    }

    if (type === 'edit' && props.onSave) {
      setState((prev) => ({ ...prev, saving: true }))
      try {
        const updates: {
          type: 'file' | 'url'
          name: string
          description: string
          file?: File
          url?: string
        } = {
          name: state.tempName,
          description: state.tempDescription,
          type: state.tempType,
        }

        if (displayType === 'file' && state.tempFile) {
          updates.file = state.tempFile
        }

        if (displayType === 'url') {
          updates.url = state.tempUrl
        }

        await props.onSave(updates)
        setState((prev) => ({ ...prev, isEditing: false, saving: false }))
      } catch (err) {
        console.error('Save error:', err)
        setState((prev) => ({ ...prev, saving: false }))
      }
    }
  }
  const displayType =
    'isDraft' in props && props.isDraft ? state.tempType : material.type
  return (
    <div className='bg-background rounded-xl shadow-md p-3 sm:p-4 hover:shadow-lg transition-shadow'>
      <div className='flex items-start gap-2 md:gap-4'>
        <MaterialIcon
          material={material}
          className={cn('mt-1', 'hidden sm:block')}
        />

        <div className='flex-1 min-w-0'>
          {/* Title row */}
          <div className='flex items-center justify-between gap-2 sm:gap-4'>
            <div className='flex items-center gap-1 min-w-0 flex-1'>
              <MaterialIcon
                material={material}
                className='sm:hidden block mr-1 shrink-0'
              />

              {state.isEditing ? (
                <div className='flex-1'>
                  {' '}
                  <Textarea
                    variant='ghost'
                    value={state.tempName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={cn(
                      'flex-1 min-h-0 text-sm sm:text-base font-semibold',
                      state.nameError && 'border-destructive',
                    )}
                    minRows={1}
                    maxRows={3}
                    placeholder='Název materiálu'
                  />
                  {state.nameError && (
                    <p className='error-text  mb-1'>{state.nameError}</p>
                  )}
                </div>
              ) : (
                <Label
                  variant='title'
                  size='md'
                  className='wrap-break-word line-clamp-3 leading-snug inline-block'
                >
                  {material.name}
                </Label>
              )}
            </div>

            {/* Buttons */}
            {type === 'edit' ? (
              <div className='flex items-center gap-1 shrink-0'>
                {state.isEditing ? (
                  <>
                    <EditBtn
                      icon={Check}
                      onClick={saveEdit}
                      classNameBtn='hover:bg-secondary/20'
                      iconClassName='text-secondary'
                      disabled={
                        state.saving || !!state.urlError || !!state.nameError
                      }
                    />
                    <EditBtn
                      icon={X}
                      onClick={cancelEdit}
                      classNameBtn='hover:bg-destructive/20'
                      iconClassName='text-destructive'
                      disabled={state.saving}
                    />
                  </>
                ) : (
                  <>
                    <EditBtn icon={Edit} onClick={startEdit} />
                    <EditBtn type='delete' onClick={props.onDelete} />
                  </>
                )}
              </div>
            ) : (
              <div className='shrink-0'>
                {material.type === 'file' ? (
                  <a
                    href={material.fileUrl}
                    download={material.originalFilename || material.name}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <EditBtn icon={Download} />
                  </a>
                ) : (
                  <div className='flex items-center'>
                    <EditBtn
                      icon={state.copied ? Check : Copy}
                      classNameBtn='mr-1 hover:bg-gray-100'
                      iconClassName={
                        state.copied ? 'text-secondary size-4' : ''
                      }
                      onClick={() => handleCopyLink(material.url)}
                    />
                    <a
                      href={material.url}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <EditBtn icon={ExternalLink} />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {state.isEditing ? (
            <Textarea
              variant='ghost'
              value={state.tempDescription}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  tempDescription: e.target.value,
                }))
              }
              className='w-full text-xs sm:text-sm'
              minRows={1}
              maxRows={5}
              placeholder='Popis materiálu'
            />
          ) : (
            material.description && (
              <p className='text-xs sm:text-sm block line-clamp-3 text-gray-600 leading-relaxed wrap-break-word mb-2'>
                {material.description}
              </p>
            )
          )}

          {/* File/URL section */}
          {state.isEditing ? (
            <div
              className={cn(
                'flex flex-wrap flex-col sm:flex-row gap-1 sm:gap-2 w-full',
                displayType === 'file' ? 'sm:items-center' : 'sm:items-start',
              )}
            >
              {' '}
              <div className={cn('flex gap-2 items-center')}>
                {'isDraft' in props && props.isDraft && (
                  <ToggleGroup
                    type='single'
                    value={state.tempType}
                    onValueChange={(value) => {
                      if (value) handleTypeChange(value as 'file' | 'url')
                    }}
                    className='justify-start border border-gray-200 shrink-0 self-start mt-0.5'
                  >
                    <ToggleGroupItem
                      value='file'
                      aria-label='Soubor'
                      className='gap-2'
                    >
                      <span>Soubor</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value='url'
                      aria-label='Odkaz'
                      className='gap-2'
                    >
                      <span>Odkaz</span>
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}

                {displayType === 'file' && (
                  <>
                    <input
                      ref={fileInputRef}
                      type='file'
                      onChange={handleFileSelect}
                      className='hidden'
                    />
                    <EditBtn
                      disabled={
                        state.saving || !!state.urlError || !!state.nameError
                      }
                      onClick={() => {
                        fileInputRef.current?.click()
                      }}
                      icon={Upload}
                      iconClassName='size-4'
                    />
                  </>
                )}
              </div>
              {displayType === 'file' ? (
                state.tempFile ? (
                  <div className='text-xs sm:text-sm text-gray-600 flex items-center gap-2'>
                    <span className='font-medium'>Nový soubor:</span>
                    <span className='truncate'>{state.tempFile.name}</span>
                    <span className='text-gray-400'>
                      ({formatFileSize(state.tempFile.size)})
                    </span>
                  </div>
                ) : (
                  <div className='text-xs sm:text-sm text-gray-500'>
                    Současný:{' '}
                    {formatFileSize(
                      material.type === 'file' ? (material.sizeBytes ?? 0) : 0,
                    )}{' '}
                  </div>
                )
              ) : (
                <div className='flex-1'>
                  <Textarea
                    variant='ghost'
                    value={state.tempUrl}
                    onChange={(e) => {
                      handleUrlChange(e.target.value)
                    }}
                    className={cn(
                      'w-full text-xs sm:text-sm mb-0',
                      state.urlError && 'border-destructive',
                    )}
                    minRows={1}
                    maxRows={3}
                    placeholder='https://example.com'
                  />
                  {state.urlError && (
                    <p className='error-text'>{state.urlError}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className='flex items-center gap-4 text-xs sm:text-sm text-gray-500'>
              {material.type === 'file' && (
                <span>{formatFileSize(material.sizeBytes)}</span>
              )}
              {material.type === 'url' && (
                <a
                  href={material.url}
                  className='text-primary hover:underline truncate'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {material.url}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MaterialCard
