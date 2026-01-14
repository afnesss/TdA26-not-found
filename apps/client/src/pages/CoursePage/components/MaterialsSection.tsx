import MaterialCard from '@/components/shared/MaterialComponent'
import StateComp from '@/components/shared/StateComp'
import { Label } from '@/components/ui/label'
import type { Material } from '@/lib/schemas/material'
import { useMediaQuery } from 'usehooks-ts'

type MaterialSectionProps = {
  materials?: Material[]
}
const MaterialsSection = ({ materials }: MaterialSectionProps) => {
  const isMd = useMediaQuery('(min-width: 768px)')

  return (
    <section>
      <Label size='default' className='font-bold mb-2'>
        Studijní Materiály
      </Label>

      <div className='space-y-3'>
        {materials && materials.length > 0 ? (
          materials.map((material) => {
            return (
              <MaterialCard
                key={material.uuid}
                material={material}
                type='classic'
              />
            )
          })
        ) : (
          <StateComp
            type='no-content'
            message='Zatím žádné materiály'
            className='pt-8 pb-0'
          />
        )}
      </div>
    </section>
  )
}

export default MaterialsSection
