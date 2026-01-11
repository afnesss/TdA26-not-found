import {
  createMaterial,
  deleteMaterial,
  getMaterials,
  updateMaterial,
} from '@/api/queries/materialQueries'
import MaterialCard from '@/components/shared/Material'
import StateComp from '@/components/shared/StateComp'
import type { Material } from '@/lib/schemas'
import { MaterialsContentSkeleton } from '@/components/shared/loadingskeleton/DetailsSkeleton'
import DetailHeader from './DetailHeader'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router'
import { toast } from 'sonner'

type MaterialDraft = {
  name?: string
  description?: string
  type: 'file' | 'url'
  file?: File
  url?: string
}

type CreateMaterialPayload =
  | {
      type: 'file'
      name: string
      file: File
      description?: string
    }
  | {
      type: 'url'
      name: string
      url: string
      description?: string
    }
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

  const updateMaterialMutation = useMutation({
    mutationFn: ({
      materialId,
      data,
    }: {
      materialId: string
      data: MaterialDraft
    }) => updateMaterial(courseId, materialId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', courseId] })
      toast.success('Materiál aktualizován')
    },
    onError: (error) => {
      console.error('Update error:', error)
      toast.error('Chyba při aktualizaci materiálu')
    },
  })

  const createMaterialMutation = useMutation({
    mutationFn: (payload: CreateMaterialPayload) =>
      createMaterial(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', courseId] })
      setDraftMaterial(null)
      toast.success('Materiál vytvořen')
    },
    onError: (error) => {
      console.error('Update error:', error)
      toast.error('Chyba při vytváření  materiálu')
    },
  })

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

    await createMaterialMutation.mutateAsync(payload)
  }

  const handleCancelDraft = () => {
    setDraftMaterial(null)
  }

  const handleUpdateMaterial = async (
    materialId: string,
    data: MaterialDraft,
  ) => {
    await updateMaterialMutation.mutateAsync({ materialId, data })
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
                    handleUpdateMaterial(material.uuid, editedMaterial)
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
