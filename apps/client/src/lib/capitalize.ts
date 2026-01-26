export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const handleCapitalizedInput = (
  value: string,
  previousValue: string = '',
): string => {
  if (!previousValue.trim() && value.length > 0) {
    return capitalizeFirstLetter(value)
  }
  return value
}
