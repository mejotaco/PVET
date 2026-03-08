import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native'
import { COLORS, RADIUS } from '../constants/theme'

interface FieldProps {
  label: string
  required?: boolean
  children: React.ReactNode
}

export function Field({ label, required, children }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}{required && <Text style={{ color: COLORS.teal }}> *</Text>}
      </Text>
      {children}
    </View>
  )
}

interface InputProps extends TextInputProps {
  label: string
  required?: boolean
}

export function FInput({ label, required, ...props }: InputProps) {
  const [focused, setFocused] = useState(false)
  return (
    <Field label={label} required={required}>
      <TextInput
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={COLORS.textMuted}
        style={[styles.input, focused && styles.inputFocused, props.style as any]}
      />
    </Field>
  )
}

interface SelectProps {
  label: string
  required?: boolean
  value: string
  options: { label: string; value: string }[]
  onChange: (value: string) => void
}

export function FSelect({ label, required, value, options, onChange }: SelectProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)

  return (
    <Field label={label} required={required}>
      <View>
        <View
          style={[styles.input, styles.selectBox]}
          onTouchEnd={() => setOpen(!open)}
        >
          <Text style={{ color: COLORS.textPrimary, fontSize: 14 }}>
            {selected?.label || 'Seleccionar...'}
          </Text>
          <Text style={{ color: COLORS.textMuted }}>▾</Text>
        </View>
        {open && (
          <View style={styles.dropdown}>
            {options.map(opt => (
              <View
                key={opt.value}
                style={[styles.dropdownItem, opt.value === value && styles.dropdownItemActive]}
                onTouchEnd={() => { onChange(opt.value); setOpen(false) }}
              >
                <Text style={{ color: opt.value === value ? COLORS.teal : COLORS.textPrimary, fontSize: 14 }}>
                  {opt.label}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Field>
  )
}

interface TextareaProps extends TextInputProps {
  label: string
  required?: boolean
}

export function FTextarea({ label, required, ...props }: TextareaProps) {
  const [focused, setFocused] = useState(false)
  return (
    <Field label={label} required={required}>
      <TextInput
        {...props}
        multiline
        numberOfLines={4}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={COLORS.textMuted}
        style={[styles.input, styles.textarea, focused && styles.inputFocused]}
      />
    </Field>
  )
}

const styles = StyleSheet.create({
  field: { gap: 6, marginBottom: 4 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.sm,
    color: COLORS.textPrimary,
    padding: 12,
    fontSize: 14,
  },
  inputFocused: {
    borderColor: COLORS.teal,
  },
  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: COLORS.navySoft,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.sm,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    maxHeight: 220,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(0,201,177,0.08)',
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
})
