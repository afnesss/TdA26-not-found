import { useState, useEffect, useCallback } from 'react'

const readLocalStorageValue = <T>(key: string, initialValue: T) => {
  if (typeof window === 'undefined') {
    return initialValue
  }

  try {
    const item = window.localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : initialValue
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error)
    return initialValue
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<{ key: string; value: T }>(() => ({
    key,
    value: readLocalStorageValue(key, initialValue),
  }))
  const storedValue =
    state.key === key ? state.value : readLocalStorageValue(key, initialValue)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const prevValue =
          prev.key === key ? prev.value : readLocalStorageValue(key, initialValue)
        const valueToStore = value instanceof Function ? value(prevValue) : value

        return {
          key,
          value: valueToStore,
        }
      })
    },
    [initialValue, key],
  )

  return [storedValue, setValue]
}
