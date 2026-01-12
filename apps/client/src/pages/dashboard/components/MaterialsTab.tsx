import {
  createMaterial,
  deleteMaterial,
  getMaterials,
  updateMaterial,
} from '@/api/queries/materialQueries'
import MaterialCard from '@/components/shared/MaterialComponent'
import StateComp from '@/components/shared/StateComp'
import type { Material } from '@/lib/schemas'
import { MaterialsContentSkeleton } from '@/components/shared/loadingskeleton/DetailsSkeleton'
import DetailHeader from './DetailHeader'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router'
import { toast } from 'sonner'
import {
  useCreateMutation,
  useUpdateMutation,
  type CreateMaterialPayload,
  type MaterialDraft,
} from './useMaterialMutation'

const MaterialsTab = ({
  courseId,
  activeTab,
}: {
  courseId: string
  activeTab: string
}) => {
  const queryClient = useQueryClient()
  const [draftMaterial, setDraftMaterial] = useState<Material | null>(null)

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

  const { mutateAsync: updateMaterialMutation } = useUpdateMutation(courseId)

  const { mutateAsync: createMaterialMutation } = useCreateMutation(
    courseId,
    setDraftMaterial,
  )

  const deleteMaterialMutation = useMutation({
    mutationFn: (variables: { courseId: string; materialId: string }) =>
      deleteMaterial(variables.courseId, variables.materialId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['materials', variables.courseId],
      })
      toast.success('Material byl smazán')
    },
    onError: () => {
      toast.error('Chyba při mazání materialu')
    },
  })

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
                  onDelete={() =>
                    deleteMaterialMutation.mutateAsync({
                      courseId,
                      materialId: material.uuid,
                    })
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
