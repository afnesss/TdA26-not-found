import { cn } from '@/lib/utils'
import UnderlinedText from './UnderlinedText'

type TitlePageProps = {
  addtext1?: string
  addtext2?: string
  underlinedText?: string
  highlightedText?: string
  underlineHeight?: string
  underlineStrokeWidth?: string
  underlineOffset?: string
  className?: string
}

const TitleText = ({
  addtext1,
  addtext2,
  underlinedText,
  highlightedText,
  underlineHeight,
  underlineStrokeWidth,
  underlineOffset,
  className,
}: TitlePageProps) => {
  return (
    <>
      <h1
        className={cn(
          'max-sm:text-2xl text-3xl lg:text-4xl text-foreground font-bold text-left',
          className,
        )}
      >
        {addtext1}
        <UnderlinedText
          className='mb-2'
          height={underlineHeight}
          strokeWidth={underlineStrokeWidth}
          offset={underlineOffset}
        >
          {underlinedText}
        </UnderlinedText>
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
