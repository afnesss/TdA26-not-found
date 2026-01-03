import MaterialCard from '@/components/shared/Material'
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
      <Label size='xl' className='pl-3 md:pl-5'>
        Studijní materiály
      </Label>

      <div className='space-y-3'>
        {materials?.map((material) => {
          return (
            <MaterialCard
              key={material.uuid}
              material={material}
              type='classic'
            />
          )
        })}
      </div>
    </section>
  )
}

export default MaterialsSection
