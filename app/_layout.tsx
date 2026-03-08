import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AppProvider } from '../context/AppContext'
import { View } from 'react-native'
import { COLORS } from '../constants/theme'

export default function RootLayout() {
  return (
    <AppProvider>
      <View style={{ flex: 1, backgroundColor: COLORS.navy }}>
        <StatusBar style="light" backgroundColor={COLORS.navy} />
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </AppProvider>
  )
}
