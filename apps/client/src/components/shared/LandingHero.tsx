import ActivitiesIcon from '@/assets/activities-blue.svg?react'
import HintPageText from '@/components/shared/HintPageText'
import LogoAnim from '@/components/shared/LogoAnim'
import TitleText from '@/components/shared/TitleText'
import UnderlinedText from '@/components/shared/UnderlinedText'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from 'usehooks-ts'

type LandingHeroVariant = 'home' | 'organization'

type LandingHeroProps = {
  variant: LandingHeroVariant
  highlightedText: string
  onPrimaryCta: () => void
  onSecondaryCta?: () => void
  showHelperText?: boolean
}

const LandingHero = ({
  variant,
  highlightedText,
  onPrimaryCta,
  onSecondaryCta,
  showHelperText = false,
}: LandingHeroProps) => {
  const isMd = useMediaQuery('(min-width: 768px)')
  const { t } = useTranslation('homepage')

  const primaryCtaLabel =
    variant === 'home'
      ? t('actions.createOrganization')
      : t('actions.browseCourses')

  const secondaryCtaLabel =
    variant === 'organization' && onSecondaryCta ? t('actions.info') : undefined

  return (
    <div className='grid grid-cols-1 md:grid-cols-[68%_32%] items-center justify-center max-w-9xl mx-auto md:px-10 lg:px-16 gap-x-10 lg:gap-x-16'>
      <div className='flex flex-col max-sm:justify-center gap-7 sm:gap-10 md:gap-10 w-full md:px-7 '>
        <HintPageText text={t('hero.eyebrow')} icon={ActivitiesIcon} />

        <TitleText
          className='max-sm:text-4xl text-5xl sm:text-5xl md:text-5xl lg:text-6xl'
          underlinedText={t('hero.title.underlined')}
          addtext2={t('hero.title.suffix')}
          highlightedText={highlightedText}
          underlineHeight={isMd ? '19' : '16'}
          underlineStrokeWidth='4'
          underlineOffset={isMd ? '-bottom-2.5' : '-bottom-1.5'}
        />

        <Label variant='description'>
          {t('hero.description.prefix')}{' '}
          <UnderlinedText
            strokeWidth={isMd ? undefined : '4'}
            height={isMd ? undefined : '9'}
            offset={isMd ? undefined : '-bottom-0.5'}
            className='font-bold'
          >
            {t('hero.description.modern')}
          </UnderlinedText>{' '}
          {t('hero.description.connector')}{' '}
          <UnderlinedText
            strokeWidth={isMd ? undefined : '4'}
            height={isMd ? undefined : '9'}
            offset={isMd ? undefined : '-bottom-0.5'}
            className='font-bold'
          >
            {t('hero.description.interactive')}
          </UnderlinedText>{' '}
          {t('hero.description.suffix')}
        </Label>

        <div className='flex flex-row gap-5'>
          <Button
            variant='primary'
            size='primary'
            className='group text-xl sm:text-xl md:text-xl'
            onClick={onPrimaryCta}
          >
            {primaryCtaLabel}
          </Button>
          {secondaryCtaLabel && onSecondaryCta ? (
            <Button
              variant='outline'
              size='primary'
              className='text-xl sm:text-xl md:text-xl'
              onClick={onSecondaryCta}
            >
              {secondaryCtaLabel}
            </Button>
          ) : null}
        </div>
        {showHelperText ? (
          <p className='text-sm text-muted-foreground'>{t('hero.helper')}</p>
        ) : null}
      </div>

      <div className='relative items-center justify-center h-full hidden md:flex'>
        <LogoAnim className='h-56 w-56 lg:h-72 lg:w-72' />
      </div>
    </div>
  )
}

export default LandingHero
