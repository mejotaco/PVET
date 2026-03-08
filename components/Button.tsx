import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { COLORS, RADIUS } from '../constants/theme'

interface ButtonProps {
  children: string
  onPress?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  disabled?: boolean
  style?: ViewStyle
}

export default function Button({ children, onPress, variant = 'primary', size = 'md', icon, disabled, style }: ButtonProps) {
  const btnStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}` as keyof typeof styles],
    disabled && styles.disabled,
    style,
  ]

  const textStyle = [
    styles.text,
    styles[`text_${variant}` as keyof typeof styles],
    styles[`textSize_${size}` as keyof typeof styles],
  ]

  return (
    <TouchableOpacity onPress={!disabled ? onPress : undefined} style={btnStyle} activeOpacity={0.8}>
      <Text style={textStyle as TextStyle}>
        {icon ? `${icon}  ` : ''}{children}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
  },
  primary: {
    backgroundColor: COLORS.teal,
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  danger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.coral,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  size_sm: { paddingHorizontal: 14, paddingVertical: 7 },
  size_md: { paddingHorizontal: 20, paddingVertical: 11 },
  size_lg: { paddingHorizontal: 26, paddingVertical: 14 },
  disabled: { opacity: 0.5 },
  text: { fontWeight: '600' },
  text_primary: { color: COLORS.navy },
  text_secondary: { color: COLORS.textPrimary },
  text_danger: { color: COLORS.coral },
  text_ghost: { color: COLORS.textSecondary },
  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 14 },
  textSize_lg: { fontSize: 16 },
})
