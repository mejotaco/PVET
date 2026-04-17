import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { executeSql, isWeb } from './db'

const AppCtx = createContext<any>(null)

function parseStoredRecord(row: any) {
  const record = typeof row.record === 'string' ? JSON.parse(row.record) : row.record
  return {
    ...(record || {}),
    createdAt: row.createdAt || record?.createdAt || new Date().toISOString(),
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [pets, setPets] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [notifications, setNotifications] = useState(true)
  const [activeTab, setActiveTab] = useState('home')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        if (!isWeb) {
          await executeSql(
            `CREATE TABLE IF NOT EXISTS pets (
              id TEXT PRIMARY KEY,
              record TEXT NOT NULL,
              createdAt TEXT
            );`
          )
          await executeSql(
            `CREATE TABLE IF NOT EXISTS appointments (
              id TEXT PRIMARY KEY,
              record TEXT NOT NULL,
              createdAt TEXT,
              status TEXT
            );`
          )

          const [petsResult, apptsResult, notifValue] = await Promise.all([
            executeSql('SELECT * FROM pets;'),
            executeSql('SELECT * FROM appointments;'),
            AsyncStorage.getItem('pvet_notif'),
          ])

          const petRows = (petsResult as any).rows._array
          const apptRows = (apptsResult as any).rows._array

          if (petRows.length > 0) {
            setPets(petRows.map(parseStoredRecord))
          }

          if (apptRows.length > 0) {
            setAppointments(apptRows.map(parseStoredRecord))
          }

          if (notifValue != null) {
            setNotifications(JSON.parse(notifValue))
          }

          if (petRows.length === 0 || apptRows.length === 0) {
            await migrateFromAsyncStorage()
          }
        } else {
          const p = await AsyncStorage.getItem('pvet_pets')
          const a = await AsyncStorage.getItem('pvet_appts')
          const n = await AsyncStorage.getItem('pvet_notif')

          if (p) setPets(JSON.parse(p))
          if (a) setAppointments(JSON.parse(a))
          if (n) setNotifications(JSON.parse(n))
        }
      } catch (error) {
        console.warn('AppContext load error', error)
      } finally {
        setLoaded(true)
      }
    }

    load()
  }, [])

  useEffect(() => {
    if (loaded && isWeb) {
      AsyncStorage.setItem('pvet_pets', JSON.stringify(pets))
    }
  }, [pets, loaded])

  useEffect(() => {
    if (loaded && isWeb) {
      AsyncStorage.setItem('pvet_appts', JSON.stringify(appointments))
    }
  }, [appointments, loaded])

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem('pvet_notif', JSON.stringify(notifications))
    }
  }, [notifications, loaded])

  const migrateFromAsyncStorage = async () => {
    try {
      const [p, a] = await Promise.all([
        AsyncStorage.getItem('pvet_pets'),
        AsyncStorage.getItem('pvet_appts'),
      ])

      if (p) {
        const storedPets = JSON.parse(p)
        await Promise.all(
          storedPets.map((pet: any) =>
            executeSql(
              `INSERT OR REPLACE INTO pets (id, record, createdAt) VALUES (?, ?, ?);`,
              [pet.id, JSON.stringify(pet), pet.createdAt || new Date().toISOString()]
            )
          )
        )
        setPets(storedPets)
      }

      if (a) {
        const storedAppts = JSON.parse(a)
        await Promise.all(
          storedAppts.map((appt: any) =>
            executeSql(
              `INSERT OR REPLACE INTO appointments (id, record, createdAt, status) VALUES (?, ?, ?, ?);`,
              [appt.id, JSON.stringify(appt), appt.createdAt || new Date().toISOString(), appt.status || 'scheduled']
            )
          )
        )
        setAppointments(storedAppts)
      }
    } catch (error) {
      console.warn('AppContext migration error', error)
    }
  }

  const addPet = async (pet: any) => {
    const record = { ...pet, id: Date.now().toString(), createdAt: new Date().toISOString() }
    try {
      if (!isWeb) {
        await executeSql(
          `INSERT INTO pets (id, record, createdAt) VALUES (?, ?, ?);`,
          [record.id, JSON.stringify(record), record.createdAt]
        )
      }
      setPets(prev => [...prev, record])
    } catch (error) {
      console.warn('addPet error', error)
    }
  }

  const updatePet = async (id: string, data: any) => {
    const existing = pets.find(p => p.id === id)
    const updated = { ...(existing || {}), ...data }
    try {
      if (!isWeb) {
        await executeSql(
          `INSERT OR REPLACE INTO pets (id, record, createdAt) VALUES (?, ?, ?);`,
          [id, JSON.stringify(updated), updated.createdAt || new Date().toISOString()]
        )
      }
      setPets(prev => prev.map(p => p.id === id ? updated : p))
    } catch (error) {
      console.warn('updatePet error', error)
    }
  }

  const deletePet = async (id: string) => {
    try {
      if (!isWeb) {
        await executeSql(`DELETE FROM pets WHERE id = ?;`, [id])
      }
      setPets(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.warn('deletePet error', error)
    }
  }

  const addAppointment = async (a: any) => {
    const record = { ...a, id: Date.now().toString(), createdAt: new Date().toISOString(), status: a.status || 'scheduled' }
    try {
      if (!isWeb) {
        await executeSql(
          `INSERT INTO appointments (id, record, createdAt, status) VALUES (?, ?, ?, ?);`,
          [record.id, JSON.stringify(record), record.createdAt, record.status]
        )
      }
      setAppointments(prev => [...prev, record])
    } catch (error) {
      console.warn('addAppointment error', error)
    }
  }

  const cancelAppointment = async (id: string) => {
    const existing = appointments.find(a => a.id === id)
    const updated = { ...(existing || {}), status: 'cancelled' }
    try {
      if (!isWeb) {
        await executeSql(
          `INSERT OR REPLACE INTO appointments (id, record, createdAt, status) VALUES (?, ?, ?, ?);`,
          [updated.id, JSON.stringify(updated), updated.createdAt || new Date().toISOString(), updated.status]
        )
      }
      setAppointments(prev => prev.map(a => a.id === id ? updated : a))
    } catch (error) {
      console.warn('cancelAppointment error', error)
    }
  }

  const toggleNotifications = () => setNotifications(v => !v)

  return (
    <AppCtx.Provider value={{ pets, addPet, updatePet, deletePet, appointments, addAppointment, cancelAppointment, notifications, toggleNotifications, activeTab, setActiveTab }}>
      {children}
    </AppCtx.Provider>
  )
}

export const useApp = () => useContext(AppCtx)
