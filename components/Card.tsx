import React from 'react'
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'
import { COLORS, RADIUS } from '../constants/theme'

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  onPress?: () => void
  glow?: boolean
}

export default function Card({ children, style, onPress, glow }: CardProps) {
  const content = (
    <View style={[styles.card, glow && styles.glow, style]}>
      {children}
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.navySoft,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.md,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  glow: {
    borderColor: COLORS.teal,
    shadowColor: COLORS.teal,
    shadowOpacity: 0.2,
  },
})
