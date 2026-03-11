// hooks/useTheme.ts
import { useColorScheme } from 'react-native'
import { DARK, LIGHT } from '../constants/theme'


export function useTheme() {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  return {
    colors: isDark ? DARK : LIGHT,
    isDark,
  }
}