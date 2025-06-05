import { ipcMain } from 'electron'
import { getRole, setRole } from './store'

export const ipcHandleAuth = () => {
  // IPC handlers
  ipcMain.handle('auth:login', (event, loginData) => {
    const { username, password } = loginData
    const isAdmin = username === 'bluewater' && password === 'admin123'
    const role = isAdmin ? 'admin' : 'guest'
    setRole(role)
    return role
  })

  ipcMain.handle('auth:logout', () => {
    setRole('guest')
    return true
  })

  ipcMain.handle('auth:getRole', () => {
    return getRole()
  })
}
