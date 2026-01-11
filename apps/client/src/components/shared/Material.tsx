import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  MaterialValidationSchema,
  type Material,
  type MaterialValidation,
} from '@/lib/schemas'
import { cn, formatFileSize, getFileIcon } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Check,
  Copy,
  Download,
  Edit,
  ExternalLink,
  Upload,
  X,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import EditBtn from '../../pages/dashboard/components/EditBtn'
import { Textarea } from '../ui/textarea'
import MaterialIcon from './MaterialIcon'

type MaterialCardProps =
  | {
      material: Material
      type: 'classic'
    }
  | {
      material: Material
      type: 'edit'
      isDraft?: boolean
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
  const [isEditing, setEditing] = useState(
    'isDraft' in props ? props.isDraft : false,
  )
  const [copied, setCopied] = useState(false)
  const [tempFile, setTempFile] = useState<File | null>(null)

  const {
    handleSubmit,
    setError,
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    setValue,
    register,
    reset,
    watch,
  } = useForm<MaterialValidation>({
    resolver: zodResolver(MaterialValidationSchema),
    defaultValues: material,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })
  const formValues = useWatch({
    control,
    defaultValue: material,
  }) as MaterialValidation

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Odkaz zkopírován')
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      toast.error('Nepodařilo se zkopírovat')
    }
  }
  const handleTypeChange = (newType: 'file' | 'url') => {
    console.log(material.type)
    setValue(`type`, newType, { shouldValidate: true })
    setTempFile(null)
    clearErrors('root.file')
    setValue('url', '')
  }

  const startEdit = () => {
    reset(material)
    setEditing(true)
  }

  const cancelEdit = () => {
    if (type === 'edit' && props.isDraft && props.onCancel) {
      props.onCancel()
    } else {
      reset(material)
      setEditing(false)
      setTempFile(null)
    }
  }

  const handleNameChange = (name: string) => {
    setValue('name', name, { shouldValidate: true })
  }

  const handleUrlChange = (url: string) => {
    setValue('url', url, { shouldValidate: true })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setTempFile(file)
    }
  }

  const saveEdit = handleSubmit(async (data: MaterialValidation) => {
    if ('isDraft' in props && props.isDraft) {
      if (data.type === 'file' && !tempFile) {
        setError('root.file', {
          type: 'manual',
          message: 'Vyberte soubor',
        })
        return
      }
    }
    try {
      const updates: {
        type: 'file' | 'url'
        name: string
        description: string
        file?: File
        url?: string
      } = {
        name: data.name,
        description: data.description ?? '',
        type: data.type,
      }

      if (data.type === 'file' && tempFile) {
        updates.file = tempFile
      }

      if (data.type === 'url') {
        updates.url = data.url ?? ''
      }

      if ('onSave' in props && props.onSave) {
        await props.onSave(updates)
      }
      setEditing(false)
    } catch (err) {
      console.error('Save error:', err)
    }
  })
  const displayType =
    'isDraft' in props && props.isDraft ? formValues.type : material.type
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

              {isEditing ? (
                <div className='flex-1'>
                  {' '}
                  <Textarea
                    variant='ghost'
                    value={formValues.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={cn(
                      'flex-1 min-h-0 text-sm sm:text-base font-semibold',
                      errors.name && 'border-destructive',
                    )}
                    minRows={1}
                    maxRows={3}
                    placeholder='Název materiálu'
                  />
                  {errors.name && (
                    <p className='error-text mb-1'>{errors.name.message}</p>
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
                {isEditing ? (
                  <>
                    <EditBtn
                      icon={Check}
                      onClick={saveEdit}
                      classNameBtn='hover:bg-secondary/20'
                      iconClassName='text-secondary'
                      disabled={
                        isSubmitting ||
                        !!errors.name ||
                        ('url' in errors && !!errors.url)
                      }
                    />
                    <EditBtn
                      icon={X}
                      onClick={cancelEdit}
                      classNameBtn='hover:bg-destructive/20'
                      iconClassName='text-destructive'
                      disabled={isSubmitting}
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
                      icon={copied ? Check : Copy}
                      classNameBtn='mr-1 hover:bg-gray-100'
                      iconClassName={copied ? 'text-secondary size-4' : ''}
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
          {isEditing ? (
            <Textarea
              variant='ghost'
              value={formValues.description}
              onChange={(e) => setValue('description', e.target.value)}
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
          {isEditing ? (
            <div
              className={cn(
                'flex flex-wrap',
                displayType === 'file' ? 'sm:items-center' : 'sm:items-start',
                'isDraft' in props && props.isDraft
                  ? 'gap-1 flex-col sm:gap-0 sm:flex-row'
                  : 'flex-row',
              )}
            >
              {' '}
              <div className={cn('flex gap-2 items-center')}>
                {'isDraft' in props && props.isDraft && (
                  <ToggleGroup
                    type='single'
                    value={formValues.type}
                    onValueChange={(value) => {
                      if (value) handleTypeChange(value as 'file' | 'url')
                    }}
                    className={cn(
                      'justify-start border border-gray-200 shrink-0 self-start',
                      formValues.type === 'url' && 'mt-1',
                    )}
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
                      type='file'
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className='hidden'
                    />
                    <EditBtn
                      disabled={
                        isSubmitting ||
                        !!errors.name ||
                        ('url' in errors && !!errors.url)
                      }
                      onClick={() => {
                        fileInputRef.current?.click()
                        clearErrors('root.file')
                      }}
                      classNameBtn='mr-2'
                      icon={Upload}
                      iconClassName={cn(
                        'size-4',
                        errors.root?.file &&
                          'text-destructive animate-pulse duration-200',
                      )}
                    />
                  </>
                )}
              </div>
              {displayType === 'file' ? (
                tempFile ? (
                  <div className='text-xs sm:text-sm text-gray-600 flex items-center gap-2'>
                    <span className='font-medium'>Nový soubor:</span>
                    <span className='truncate'>{tempFile.name}</span>
                    <span className='text-gray-400'>
                      ({formatFileSize(tempFile.size)})
                    </span>
                  </div>
                ) : errors.root?.file ? (
                  <p className='error-text'>{errors.root.file.message}</p>
                ) : (
                  <div className='flex gap-2 text-xs flex-row items-end sm:text-sm text-gray-500'>
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
                    value={
                      formValues.type === 'url' ? formValues.url || '' : ''
                    }
                    onChange={(e) => {
                      handleUrlChange(e.target.value)
                    }}
                    className={cn(
                      'w-full text-xs sm:text-sm mb-0',
                      'url' in errors && !!errors.url && 'border-destructive',
                    )}
                    minRows={1}
                    maxRows={3}
                    placeholder='https://example.com'
                  />
                  {'url' in errors && !!errors.url && (
                    <p className='error-text'>{errors.url.message}</p>
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
