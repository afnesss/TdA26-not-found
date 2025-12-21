import { cn } from "@/lib/utils"

type TitlePageProps ={
  addtext1?: string,
  addtext2?: string,
  underlinedText?: string,
  highlightedText?: string,
  
}

const TitleText = ({addtext1, addtext2, underlinedText, highlightedText}: TitlePageProps) => {
  return (
    <>
    <h1 className=' max-sm:text-2xl text-3xl lg:text-4xl text-foreground font-bold text-left'>
      {addtext1}
      <span className="relative inline-block mb-2">
        {underlinedText}
        <svg 
          className="absolute -bottom-1.5 left-0 w-full overflow-visible" 
          height="12" 
          viewBox="0 0 400 12"
          preserveAspectRatio="none"
        >
          <path 
            d="M0,10 Q50,3 110,9 Q150,14 200,4 Q250,2 300,11 Q350,15 400,6"
            stroke="#91F5AD" 
            strokeWidth="5" 
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </span> 
      {addtext2}
       <br/>
      <span className='text-primary'>{highlightedText}</span>
    </h1>
    </>
  )
}

export default TitleText
