const HomeBoxDetail = ({bg, icon: Icon, text}) => {
  const bgClasses = {
    'accent-teal-light': 'bg-gradient-to-br from-accent-teal-light/20 to-accent-teal-light/60 text-[#2D8B6B]' ,
    'accent-teal': 'bg-gradient-to-br from-accent-teal/20 to-accent-teal/60 text-[#246969]',
    'accent-teal-dark': 'bg-gradient-to-br from-accent-teal-dark/20 to-accent-teal-dark/60 text-[#166289]',
  }

  return (
    <div className={`h-20 lg:w-50 md:h-30 ${bgClasses[bg]} p-2 md:p-3 lg:p-5 rounded-xl text-center font-semibold text-md lg:text-lg flex justify-center flex-col transition-all hover:scale-105 duration-200 shadow-lg hover:shadow-xl`}>
      <div className="h-8 lg:h-12 flex justify-center items-center">
        <Icon className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12"/>
      </div>
      <p className='text-xs sm:text-sm md:text-base'>{text}</p>
    </div>
  )
}

export default HomeBoxDetail