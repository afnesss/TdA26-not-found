import MaterialCard from '@/components/shared/MaterialComponent'
import StateComp from '@/components/shared/StateComp'
import UnderlinedText from '@/components/shared/UnderlinedText'
import { Label } from '@/components/ui/label'
import type { CourseStatus, Material } from '@/lib/schemas'
import type { MaterialDraft } from '../../CoursePage/utils/useMaterialMutation'
import DashboardAddButton from './DashboardAddButton'
import { useTranslation } from 'react-i18next'

interface MaterialsSectionProps {
  materials: Material[]
  draftMaterial: Material | null
  previewMode: boolean
  canEdit: boolean
  courseStatus?: CourseStatus
  onAddMaterial: () => void
  onSaveMaterial: (materialId: string, data: MaterialDraft) => Promise<void>
  onDeleteMaterial: (materialId: string) => Promise<void>
  onSaveDraft: (data: MaterialDraft) => Promise<void>
  onCancelDraft: () => void
}

const MaterialsSection = ({
  materials,
  draftMaterial,
  previewMode,
  canEdit,
  courseStatus,
  onAddMaterial,
  onSaveMaterial,
  onDeleteMaterial,
  onSaveDraft,
  onCancelDraft,
}: MaterialsSectionProps) => {
  const isEmpty = !draftMaterial && materials.length === 0
  const { t } = useTranslation('dashboard')

  return (
    <section className='space-y-3'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Label className='font-bold'>
          <UnderlinedText strokeWidth='4'>
            {t('moduleDetail.materialsSection.title')}
          </UnderlinedText>
        </Label>
        {!previewMode && (
          <DashboardAddButton
            label={t('moduleDetail.materialsSection.add')}
            onClick={onAddMaterial}
            disabled={!!draftMaterial}
          />
        )}
      </div>

      <div className='space-y-3'>
        {isEmpty ? (
          <StateComp
            type='no-content'
            message={t('moduleDetail.materialsSection.empty')}
            className='pt-8 pb-0'
          />
        ) : (
          <>
            {draftMaterial && (
              <MaterialCard
                material={draftMaterial}
                type='edit'
                courseStatus={courseStatus}
                isDraft={true}
                onSave={onSaveDraft}
                onCancel={onCancelDraft}
              />
            )}
            {materials.map((mat) =>
              canEdit ? (
                <MaterialCard
                  key={mat.uuid}
                  material={mat}
                  type='edit'
                  courseStatus={courseStatus}
                  onDelete={() => onDeleteMaterial(mat.uuid)}
                  onSave={(editedMaterial) =>
                    onSaveMaterial(mat.uuid, editedMaterial)
                  }
                />
              ) : (
                <MaterialCard
                  key={mat.uuid}
                  material={mat}
                  type='classic'
                  courseStatus={courseStatus}
                />
              ),
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default MaterialsSection
