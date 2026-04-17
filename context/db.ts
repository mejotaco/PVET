import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite'
import { Platform } from 'react-native'

export const isWeb = Platform.OS === 'web'
export const db: SQLiteDatabase | null = isWeb ? null : openDatabaseSync('pvet.db')

export function executeSql<T = any>(sql: string, params: any[] = []): Promise<T> {
  if (isWeb) {
    return Promise.reject(new Error('SQLite is not available on web'))
  }

  return new Promise((resolve, reject) => {
    try {
      const normalizedSql = sql.trim().toUpperCase()
      if (normalizedSql.startsWith('SELECT')) {
        const rows = db!.getAllSync<any>(sql, params)
        resolve({ rows: { _array: rows } } as unknown as T)
        return
      }

      const result = db!.runSync(sql, params)
      resolve(result as unknown as T)
    } catch (error: unknown) {
      console.error('SQLite executeSql error', sql, params, error)
      reject(error)
    }
  })
}
