import UploadIcon from '@/assets/upload-black.svg?react'
import {
  getMaterialDownloadUrl,
  trackMaterialInteraction,
} from '@/api/queries/materialQueries'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  MaterialValidationSchema,
  type CourseStatus,
  type MaterialInteractionAction,
  type Material,
  type MaterialValidation,
} from '@/lib/schemas'
import { cn, formatFileSize } from '@/lib/utils'
import { handleCapitalizedInput } from '@/lib/capitalize'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Copy, Download, Edit, ExternalLink } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLocation, useParams } from 'react-router'
import { toast } from 'sonner'
import EditBtn from '../../pages/dashboard/components/EditBtn'
import DeleteConfirmDialog from '../ui/AlertDialog'
import { Textarea } from '../ui/textarea'
import MaterialIcon from './MaterialIcon'
import EditSaveCancelButtons from './EditSaveCancelButtons'
import { handleSaveOnEnter } from '@/pages/CoursePage/utils/helperFunctions'

const countStyle = (count: number): string => {
  return cn(
    'absolute -top-1.5 -right-1.5 w-4 h-4 px-0.5 text-xs  rounded-full font-semibold shrink-0   text-center',
    count === 0
      ? 'bg-muted-foreground/10 text-muted-foreground/60'
      : 'text-accent-teal bg-accent-teal/20',
  )
}

type MaterialCardProps =
  | {
      material: Material
      type: 'classic'
      courseStatus?: CourseStatus
    }
  | {
      material: Material
      type: 'edit'
      courseStatus?: CourseStatus
      isDraft?: boolean
      onDelete?: () => Promise<void>
      onCancel?: () => void
      onSave?: (data: {
        type: 'file' | 'url'
        name?: string
        description?: string
        file?: File
        url?: string
      }) => Promise<void>
    }

const MaterialCard = (props: MaterialCardProps) => {
  const { material, type } = props
  const { t } = useTranslation('common')
  const { courseId, moduleId } = useParams<{
    courseId: string
    moduleId: string
  }>()
  const { pathname } = useLocation()
  const isDashboardPage = pathname.includes('/dashboard')
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
    formState: { errors, isSubmitting, isDirty },
    setValue,
    reset,
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

  const runInteraction = async (action: MaterialInteractionAction) => {
    if (!courseId || !moduleId) return
    if (isDashboardPage) return

    try {
      await trackMaterialInteraction(courseId, moduleId, material.uuid, action)
    } catch (error) {
      console.error('Interaction tracking failed:', error)
    }
  }

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      void runInteraction('copy')
      setCopied(true)
      toast.success(t('materialCard.linkCopied'))
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      toast.error(t('materialCard.copyFailed'))
    }
  }
  const handleTypeChange = (newType: 'file' | 'url') => {
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

  const handleFieldChange = (field: 'name' | 'description', value: string) => {
    const capitalizedValue = handleCapitalizedInput(
      value,
      formValues[field] ?? '',
    )
    setValue(field, capitalizedValue, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const handleUrlChange = (url: string) => {
    setValue('url', url, { shouldValidate: true, shouldDirty: true })
  }

  const handleDownloadClick = () => {
    if (!downloadUrl) return
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download =
      material.type === 'file'
        ? material.originalFilename || material.name
        : material.name
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    link.remove()
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
          message: t('materialCard.selectFile'),
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
  const showLecturerCounters = isDashboardPage && !isEditing
  const downloadUrl =
    material.type === 'file' && courseId && moduleId
      ? isDashboardPage
        ? material.fileUrl
        : getMaterialDownloadUrl(courseId, moduleId, material.uuid)
      : material.type === 'file'
        ? material.fileUrl
        : undefined
  return (
    <div className='bg-background rounded-xl shadow-md p-3 sm:p-4 hover:shadow-lg transition-shadow'>
      <div className='flex items-start gap-2 md:gap-4'>
        <div className='flex-1 min-w-0 flex flex-col gap-1'>
          {/* Title row */}
          <div className='flex items-center justify-between gap-2 sm:gap-4'>
            <div className='flex items-center gap-1 min-w-0 flex-1'>
              {!('isDraft' in props && props.isDraft) && (
                <MaterialIcon
                  material={material}
                  className='block mr-1 shrink-0'
                />
              )}

              {isEditing ? (
                <div className='flex-1'>
                  <div className='flex items-center gap-1'>
                    <div className='flex-1'>
                      <Textarea
                        variant='ghost'
                        value={formValues.name}
                        onChange={(e) =>
                          handleFieldChange('name', e.target.value)
                        }
                        onKeyDown={(e) =>
                          handleSaveOnEnter(e, saveEdit, cancelEdit)
                        }
                        className={cn(
                          'w-full min-h-0 text-sm sm:text-base font-semibold block',
                          errors.name && 'border-destructive',
                        )}
                        minRows={1}
                        maxRows={3}
                        placeholder={t('materialCard.namePlaceholder')}
                      />
                    </div>

                    <EditSaveCancelButtons
                      className='flex items-center gap-1 shrink-0'
                      onSave={saveEdit}
                      onCancel={cancelEdit}
                      saveAriaLabel={t('materialCard.saveAria')}
                      saveDisabled={
                        isSubmitting ||
                        !!errors.name ||
                        ('url' in errors && !!errors.url) ||
                        (props.type === 'edit' &&
                        'isDraft' in props &&
                        props.isDraft
                          ? false
                          : !isDirty && !tempFile)
                      }
                      cancelDisabled={isSubmitting}
                    />
                  </div>
                  {errors.name && (
                    <p className='error-text mb-1'>{errors.name.message}</p>
                  )}
                </div>
              ) : (
                <div className='flex-1 flex items-center justify-between gap-2 sm:gap-4'>
                  <Label
                    variant='title'
                    size='md'
                    className='wrap-break-word line-clamp-3 leading-snug inline-block'
                  >
                    {material.name}
                  </Label>

                  {type === 'edit' ? (
                    <div className='flex items-center gap-1 shrink-0'>
                      <EditBtn
                        icon={Edit}
                        onClick={startEdit}
                        aria-label={t('materialCard.editAria', {
                          name: material.name,
                        })}
                      />
                      <DeleteConfirmDialog
                        trigger={
                          <EditBtn
                            actionType='delete'
                            aria-label={t('materialCard.deleteAria', {
                              name: material.name,
                            })}
                          />
                        }
                        itemName={material.name}
                        itemType={t('materialCard.deleteItemType')}
                        onConfirm={() => {
                          if (props.onDelete) {
                            props.onDelete()
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className='shrink-0 flex items-center gap-1'>
                      {material.type === 'file' ? (
                        <div className='relative'>
                          <EditBtn
                            icon={Download}
                            onClick={handleDownloadClick}
                            aria-label={t('materialCard.downloadAria', {
                              name: material.name,
                            })}
                            label={t('materialCard.downloadLabel')}
                            labelClassName='max-sm:hidden inline text-current whitespace-nowrap'
                            classNameBtn='h-7 px-2'
                          />
                          {showLecturerCounters &&
                            (material.downloadCount ?? 0) >= 0 && (
                              <span
                                className={countStyle(
                                  material.downloadCount ?? 0,
                                )}
                              >
                                {(material.downloadCount ?? 0) > 99
                                  ? '99+'
                                  : material.downloadCount}
                              </span>
                            )}
                        </div>
                      ) : (
                        <>
                          <div className='relative'>
                            <EditBtn
                              icon={copied ? Check : Copy}
                              classNameBtn='hover:bg-gray-100'
                              iconClassName={
                                copied ? 'text-secondary size-4' : ''
                              }
                              onClick={() => handleCopyLink(material.url)}
                              aria-label={
                                copied
                                  ? t('materialCard.copiedAria')
                                  : t('materialCard.copyLinkAria')
                              }
                            />
                            {showLecturerCounters &&
                              (material.copyCount ?? 0) >= 0 && (
                                <span
                                  className={countStyle(
                                    material.copyCount ?? 0,
                                  )}
                                >
                                  {(material.copyCount ?? 0) > 99
                                    ? '99+'
                                    : material.copyCount}
                                </span>
                              )}
                          </div>
                          <div className='relative'>
                            <a
                              href={material.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              aria-label={t('materialCard.openNewTabAria', {
                                name: material.name,
                              })}
                              onClick={() => void runInteraction('open')}
                            >
                              <EditBtn
                                icon={ExternalLink}
                                aria-label={t('materialCard.openNewTabAria', {
                                  name: material.name,
                                })}
                              />
                            </a>
                            {showLecturerCounters &&
                              (material.openCount ?? 0) >= 0 && (
                                <span
                                  className={countStyle(
                                    material.openCount ?? 0,
                                  )}
                                >
                                  {(material.openCount ?? 0) > 99
                                    ? '99+'
                                    : material.openCount}
                                </span>
                              )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Description */}
          {isEditing ? (
            <Textarea
              variant='ghost'
              value={formValues.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              onKeyDown={(e) => handleSaveOnEnter(e, saveEdit, cancelEdit)}
              className='block w-full text-xs sm:text-sm'
              minRows={1}
              maxRows={5}
              placeholder={t('materialCard.descriptionPlaceholder')}
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
                displayType === 'file' ? 'items-center' : 'sm:items-start',
                'isDraft' in props && props.isDraft
                  ? 'gap-1 flex-col sm:gap-0 sm:flex-row'
                  : 'flex-row',
              )}
            >
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
                      formValues.type === 'url' && 'mt-1 mr-1',
                    )}
                  >
                    <ToggleGroupItem
                      value='file'
                      aria-label={t('materialCard.typeFile')}
                      className='gap-2'
                    >
                      <span>{t('materialCard.typeFile')}</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value='url'
                      aria-label={t('materialCard.typeUrl')}
                      className='gap-2'
                    >
                      <span>{t('materialCard.typeUrl')}</span>
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
                      icon={UploadIcon}
                      iconClassName={cn(
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
                    <span className='font-medium'>{t('materialCard.newFile')}</span>
                    <span className='truncate'>{tempFile.name}</span>
                    <span className='text-gray-400'>
                      ({formatFileSize(tempFile.size)})
                    </span>
                  </div>
                ) : errors.root?.file ? (
                  <p className='error-text'>{errors.root.file.message}</p>
                ) : (
                  <div className='flex gap-1 text-xs flex-row sm:items-end sm:text-sm text-gray-500'>
                    <span className='font-medium'>
                      {t('materialCard.currentFile')}
                    </span>
                    <span className='truncate'>
                      {material.type === 'file' && material.originalFilename}
                    </span>
                    <span className='text-gray-400'>
                      (
                      {formatFileSize(
                        material.type === 'file'
                          ? (material.sizeBytes ?? 0)
                          : 0,
                      )}
                      )
                    </span>
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
                    onKeyDown={(e) =>
                      handleSaveOnEnter(e, saveEdit, cancelEdit)
                    }
                    className={cn(
                      'block w-full text-xs sm:text-sm mb-0',
                      'url' in errors && !!errors.url && 'border-destructive',
                    )}
                    minRows={1}
                    maxRows={3}
                    placeholder={t('materialCard.urlPlaceholder')}
                  />
                  {'url' in errors && !!errors.url && (
                    <p className='error-text'>{errors.url.message}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className='flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500'>
              {material.type === 'file' && (
                <>
                  <span className='font-medium text-gray-600 '>
                    {t('materialCard.downloadableFile')}
                  </span>
                  <span className='text-accent-teal font-semibold'>
                    {formatFileSize(material.sizeBytes)}
                  </span>
                </>
              )}
              {material.type === 'url' && (
                <>
                  <span className='font-medium text-gray-600'>
                    {t('materialCard.linkLabel')}
                  </span>
                  <a
                    href={material.url}
                    className='text-primary hover:underline break-all'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {material.url}
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MaterialCard
