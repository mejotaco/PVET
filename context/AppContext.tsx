import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const AppCtx = createContext<any>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [pets, setPets] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [notifications, setNotifications] = useState(true)
  const [activeTab, setActiveTab] = useState('home')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const p = await AsyncStorage.getItem('pvet_pets')
        const a = await AsyncStorage.getItem('pvet_appts')
        const n = await AsyncStorage.getItem('pvet_notif')
        if (p) setPets(JSON.parse(p))
        if (a) setAppointments(JSON.parse(a))
        if (n) setNotifications(JSON.parse(n))
      } catch {}
      setLoaded(true)
    }
    load()
  }, [])

  useEffect(() => { if (loaded) AsyncStorage.setItem('pvet_pets', JSON.stringify(pets)) }, [pets])
  useEffect(() => { if (loaded) AsyncStorage.setItem('pvet_appts', JSON.stringify(appointments)) }, [appointments])
  useEffect(() => { if (loaded) AsyncStorage.setItem('pvet_notif', JSON.stringify(notifications)) }, [notifications])

  const addPet = (pet: any) => setPets(prev => [...prev, { ...pet, id: Date.now().toString(), createdAt: new Date().toISOString() }])
  const updatePet = (id: string, data: any) => setPets(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
  const deletePet = (id: string) => setPets(prev => prev.filter(p => p.id !== id))
  const addAppointment = (a: any) => setAppointments(prev => [...prev, { ...a, id: Date.now().toString(), createdAt: new Date().toISOString(), status: 'scheduled' }])
  const cancelAppointment = (id: string) => setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a))
  const toggleNotifications = () => setNotifications(v => !v)

  return (
    <AppCtx.Provider value={{ pets, addPet, updatePet, deletePet, appointments, addAppointment, cancelAppointment, notifications, toggleNotifications, activeTab, setActiveTab }}>
      {children}
    </AppCtx.Provider>
  )
}

export const useApp = () => useContext(AppCtx)
