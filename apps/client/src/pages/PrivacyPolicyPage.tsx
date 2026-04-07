import HintPageText from '@/components/shared/HintPageText'
import LegalSection, { LegalText } from '@/components/shared/LegalSection'
import TitleText from '@/components/shared/TitleText'
import { Label } from '@/components/ui/label'
import { useTitle } from '@/lib/dynamicTitleHook'
import { Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAutoTopScroll } from './CoursePage/utils/helperFunctions'

const PrivacyPolicyPage = () => {
  const { t } = useTranslation('legal')
  const sections = t('privacyPolicy.sections', { returnObjects: true }) as Array<{
    title: string
    paragraphs: string[]
    bullets?: string[]
  }>

  useTitle(t('privacyPolicy.pageTitle'))
  useAutoTopScroll()

  return (
    <div className='max-w-6xl mx-auto lg:px-5 pb-5'>
      <div className='flex flex-col gap-6'>
        <HintPageText text={t('privacyPolicy.eyebrow')} icon={Shield} />

        <TitleText
          underlinedText={t('privacyPolicy.title.underlined')}
          addtext2={t('privacyPolicy.title.suffix')}
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
              {t('privacyPolicy.effectiveDate')}
            </Label>
          </section>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage
