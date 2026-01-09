import {
  createMaterial,
  getMaterials,
  updateMaterial,
} from '@/api/queries/materialQueries'
import MaterialCard from '@/components/shared/Material'
import StateComp from '@/components/shared/StateComp'
import type { Material } from '@/lib/schemas'
import { MaterialsContentSkeleton } from '@/components/shared/loadingskeleton/DetailsSkeleton'
import DetailHeader from './DetailHeader'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router'

const MaterialsTab = ({ activeTab }: { activeTab: string }) => {
  const queryClient = useQueryClient()
  const [draftMaterial, setDraftMaterial] = useState<Material | null>(null)
  const { courseId } = useParams<{ courseId: string }>()

  const {
    data: materials = [],
    isError: materialsError,
    isLoading: materialsLoading,
    refetch: refetchMaterials,
  } = useQuery<Material[] | null>({
    queryKey: ['materials', courseId],
    queryFn: () => getMaterials(courseId!),
    enabled: Boolean(courseId) && activeTab === 'materials',
  })
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
  const onSaveDraft = async (data: {
    name?: string
    description?: string
    file?: File
    url?: string
  }) => {
    if (!draftMaterial || !courseId) return

    setDraftMaterial(null)

    const payload =
      draftMaterial.type === 'file'
        ? {
            type: 'file' as const,
            name: data.name || draftMaterial.name,
            file: data.file!,
            description: data.description,
          }
        : {
            type: 'url' as const,
            name: data.name || draftMaterial.name,
            url: data.url!,
            description: data.description,
          }

    await createMaterial(courseId, payload)

    queryClient.invalidateQueries({
      queryKey: ['materials', courseId],
    })
  }
  return (
    <div className='space-y-6'>
      <DetailHeader
        onButtonClick={() => {
          console.log('зробити матеріал')
          handleAddMaterial()
        }}
        title='Materiály kurzu'
        gradient='accent-teal'
        buttonText='Přidat podklad'
      />

      {materialsLoading ? (
        <MaterialsContentSkeleton />
      ) : materialsError ? (
        <StateComp
          type='error'
          onAction={() => refetchMaterials()}
          message='Nepodařilo se načíst materiály'
        />
      ) : (materials && materials.length > 0) || draftMaterial ? (
        <div className='grid gap-4'>
          {draftMaterial && (
            <MaterialCard
              material={draftMaterial as Material}
              type='edit'
              isDraft={true}
              onSave={onSaveDraft}
              onCancel={() => setDraftMaterial(null)}
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
                    if (courseId) {
                      await updateMaterial(
                        courseId,
                        material.uuid,
                        editedMaterial,
                      )
                      queryClient.invalidateQueries({
                        queryKey: ['materials', courseId],
                      })
                    }
                  }}
                  onDelete={() => console.log('Delete', material.uuid)}
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
