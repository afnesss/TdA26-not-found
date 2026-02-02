import { cn } from '@/lib/utils'
import UnderlinedText from './UnderlinedText'

type TitlePageProps = {
  addtext1?: string
  addtext2?: string
  underlinedText?: string
  highlightedText?: string
}

const TitleText = ({
  addtext1,
  addtext2,
  underlinedText,
  highlightedText,
}: TitlePageProps) => {
  return (
    <>
      <h1 className=' max-sm:text-2xl text-3xl lg:text-4xl text-foreground font-bold text-left'>
        {addtext1}
        <UnderlinedText className='mb-2'>{underlinedText}</UnderlinedText>
        {addtext2}
        <br />
        {highlightedText && (
          <span className='text-primary'>{highlightedText}</span>
        )}
      </h1>
    </>
  )
}

export default TitleText
