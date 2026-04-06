import HintPageText from '@/components/shared/HintPageText'
import LogoAnim from '@/components/shared/LogoAnim'
import TitleText from '@/components/shared/TitleText'
import { Label } from '@/components/ui/label'
import { Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

type AuthPageShellProps = {
  cardTitle: string
  children: ReactNode
}

const AuthPageShell = ({ cardTitle, children }: AuthPageShellProps) => {
  const { t } = useTranslation('login')

  return (
    <div className='w-full max-w-6xl mx-auto grid h-full md:grid-cols-2 lg:grid-cols-2'>
      <div className='relative justify-center h-full hidden md:flex items-center px-4 md:pl-6 lg:pl-10 lg:pr-20'>
        <div className='space-y-8 text-left'>
          <HintPageText icon={Sparkles} text={t('shell.eyebrow')} />
          <TitleText
            underlinedText={t('shell.title.underlined')}
            highlightedText={t('shell.title.highlighted')}
          />

          <div className='relative flex items-center justify-center pt-8'>
            <LogoAnim sizeBlur1='w-40 h-40' sizeBlur2='w-48 h-48' />
          </div>
        </div>
      </div>

      <div className='flex justify-center items-center w-full md:px-6 lg:px-10'>
        <div className='w-full max-w-md'>
          <div className='bg-background/80 backdrop-blur-xl rounded-2xl shadow-xl md:shadow-2xl overflow-hidden border border-foreground/10'>
            <Label variant='formTitle'>{cardTitle}</Label>
            <div className='px-5 sm:px-6 lg:px-8 py-6 md:py-8 bg-background/95'>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPageShell
