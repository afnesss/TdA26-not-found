import { getMaterials } from '@/api/queries/materialQueries'
import { MaterialsContentSkeleton } from '@/components/shared/loadingskeleton/DetailsSkeleton'
import MaterialCard from '@/components/shared/MaterialComponent'
import StateComp from '@/components/shared/StateComp'
import type { Material } from '@/lib/schemas'
import type { ApiError } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  useCreateMutation,
  useDeleteMaterialMutation,
  useUpdateMutation,
  type CreateMaterialPayload,
  type MaterialDraft,
} from '../../CoursePage/utils/useMaterialMutation'
import DetailHeader from './DetailHeader'

const MaterialsTab = ({
  courseId,
  activeTab,
}: {
  courseId: string
  activeTab: string
}) => {
  const [draftMaterial, setDraftMaterial] = useState<Material | null>(null)
  const isOffline = !navigator.onLine
  const {
    data: materials = [],
    isError: materialsError,
    error: materialsErrorObj,
    isLoading: materialsLoading,
    refetch: refetchMaterials,
  } = useQuery<Material[] | null, ApiError>({
    queryKey: ['materials', courseId],
    queryFn: () => getMaterials(courseId!),
    enabled: Boolean(courseId) && activeTab === 'materials',
    refetchOnMount: 'always',
    networkMode: 'always',
  })

  const isNetworkError = materialsErrorObj?.isNetworkError ?? false

  const { mutateAsync: updateMaterialMutation } = useUpdateMutation(courseId)

  const { mutateAsync: createMaterialMutation } = useCreateMutation(
    courseId,
    setDraftMaterial,
  )

  const { mutateAsync: deleteMaterialMutation } =
    useDeleteMaterialMutation(courseId)

  const handleSaveDraft = async (data: MaterialDraft) => {
    if (!draftMaterial) return

    const payload: CreateMaterialPayload =
      data.type === 'file'
        ? {
            type: 'file',
            name: data.name || draftMaterial.name || '',
            file: data.file!,
            description: data.description || '',
          }
        : {
            type: 'url',
            name: data.name || draftMaterial.name || '',
            url: data.url!,
            description: data.description || '',
          }

    await createMaterialMutation(payload)
  }

  const handleCancelDraft = () => {
    setDraftMaterial(null)
  }

  const handleUpdateMaterial = async (
    materialId: string,
    data: MaterialDraft,
  ) => {
    await updateMaterialMutation({ materialId, data })
  }
  const handleAddMaterial = () => {
    const newDraft: Material = {
      uuid: `temp-${Date.now()}`,
      name: '',
      description: '',
      type: 'file',
      fileUrl: '',
    }
    setDraftMaterial(newDraft)
  }

  return (
    <div className='space-y-6'>
      <DetailHeader
        onButtonClick={handleAddMaterial}
        title='Studijní Materiály'
        gradient='accent-teal'
        buttonText='Přidat podklad'
      />

      {materialsLoading ? (
        <MaterialsContentSkeleton />
      ) : isOffline && materials?.length === 0 ? (
        <StateComp type='network-offline' onAction={() => refetchMaterials()} />
      ) : materialsError ? (
        <StateComp
          type={isNetworkError ? 'network-offline' : 'error'}
          onAction={() => refetchMaterials()}
          message={
            isNetworkError ? undefined : 'Nepodařilo se načíst materiály'
          }
        />
      ) : (materials && materials.length > 0) || draftMaterial ? (
        <div className='grid gap-4'>
          {draftMaterial && (
            <MaterialCard
              material={draftMaterial as Material}
              type='edit'
              isDraft={true}
              onSave={handleSaveDraft}
              onCancel={handleCancelDraft}
            />
          )}
          {materials && materials.length > 0 && (
            <>
              {materials.map((material) => (
                <MaterialCard
                  key={material.uuid}
                  material={material}
                  type='edit'
                  onSave={async (editedMaterial) => {
                    await handleUpdateMaterial(material.uuid, editedMaterial)
                  }}
                  onDelete={async () =>
                    await deleteMaterialMutation(material.uuid)
                  }
                />
              ))}
            </>
          )}
        </div>
      ) : (
        <StateComp type='no-content' message='Zatím žádné materiály' />
      )}
    </div>
  )
}

export default MaterialsTab
