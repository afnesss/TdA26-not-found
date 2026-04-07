import HintPageText from '@/components/shared/HintPageText'
import LegalSection, { LegalText } from '@/components/shared/LegalSection'
import TitleText from '@/components/shared/TitleText'
import { Label } from '@/components/ui/label'
import { useTitle } from '@/lib/dynamicTitleHook'
import { FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAutoTopScroll } from './CoursePage/utils/helperFunctions'

const TermsOfUsePage = () => {
  const { t } = useTranslation('legal')
  const sections = t('termsOfUse.sections', { returnObjects: true }) as Array<{
    title: string
    paragraphs: string[]
    bullets?: string[]
  }>

  useTitle(t('termsOfUse.pageTitle'))
  useAutoTopScroll()

  return (
    <div className='max-w-6xl mx-auto lg:px-5 pb-5'>
      <div className='flex flex-col gap-6'>
        <HintPageText text={t('termsOfUse.eyebrow')} icon={FileText} />

        <TitleText
          underlinedText={t('termsOfUse.title.underlined')}
          addtext2={t('termsOfUse.title.suffix')}
        />

        <div className='bg-background rounded-xl shadow-lg py-4 px-5 md:px-6 space-y-6'>
          {sections.map((section) => (
            <LegalSection key={section.title} title={section.title}>
              <div className='space-y-2 flex flex-col'>
                {section.paragraphs.map((paragraph) => (
                  <LegalText key={paragraph}>{paragraph}</LegalText>
                ))}
                {section.bullets ? (
                  <ul className='list-disc list-inside space-y-1 ml-4'>
                    {section.bullets.map((bullet) => (
                      <LegalText key={bullet} className='block'>
                        <li>{bullet}</li>
                      </LegalText>
                    ))}
                  </ul>
                ) : null}
              </div>
            </LegalSection>
          ))}

          <section className='pt-4 border-t border-gray-200'>
            <Label variant='descriptionSmall' size='sm' className='italic'>
              {t('termsOfUse.effectiveDate')}
            </Label>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TermsOfUsePage
