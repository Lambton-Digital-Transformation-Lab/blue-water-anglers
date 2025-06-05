import { app, shell, BrowserWindow, ipcMain, screen, dialog } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { initializeDatabase } from './database/initializeDatabase'
import {
  insertRecords,
  editRecords,
  deleteRecords,
  getPaginatedReadings,
  getDataUsingDate,
  getRecordById,
  insertTanks,
  getAllTankInfo,
  getTankById,
  updateTankInfo,
  getTotalNumberOfPages,
  activateTanks,
  getLastWeekData,
  getTodaysReadings,
  getFirstRecordYear
} from './database/CRUD'
import { ipcHandleAuth } from './auth/auth'
import { setRole } from './auth/store'
import { exportToExcel } from './generateReport/generateReport'
import { saveGraphs } from './saveGraphs/saveGraphs'
import fs from 'fs'

import { autoUpdater } from 'electron-updater'

import { monitorAndBackup } from './backup/backup'

function setupAutoUpdater(mainWindow) {
  autoUpdater.autoDownload = true

  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify()
  })

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...')
  })

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info)
    mainWindow.webContents.send('update_available', info)
  })

  autoUpdater.on('update-not-available', (info) => {
    console.log('No update available:', info)
    mainWindow.webContents.send('update_not_available', info)
  })

  autoUpdater.on('error', (err) => {
    console.error('Error in auto-updater:', err)
    mainWindow.webContents.send('update_error', err.message)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('download_progress', progressObj)
  })

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded')
    // Uncomment to auto-install after download
    autoUpdater.quitAndInstall()
  })
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const mainWindow = new BrowserWindow({
    width,
    height,
    show: false,
    title: 'Bluewater Anglers - Data Sheet',
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

function handleIPC() {
  ipcMain.handle('get-total-number-of-pages', async (event, tableName) => {
    try {
      const result = await getTotalNumberOfPages(tableName)
      return result
    } catch (error) {
      console.error('Error reading total number of pages: ', error)
      throw error
    }
  })

  // Listen for the 'insert-records' event
  ipcMain.handle('insert-records', async (event, readingData) => {
    try {
      const result = await insertRecords(readingData)
      return result
    } catch (error) {
      console.error('Error creating plant reading with tanks:', error)
      throw error
    }
  })

  ipcMain.handle('insert-tanks', async (event, tankName, tankActive) => {
    try {
      const result = await insertTanks(tankName, tankActive)
      return result
    } catch (error) {
      console.error('Error inserting tank name: ', error)
      throw error
    }
  })

  // Edit Records
  ipcMain.handle('edit-records', async (event, readingData) => {
    try {
      const result = await editRecords(readingData)
      return result
    } catch (error) {
      console.error('Log Error', error)
      throw error
    }
  })

  // Delete records
  ipcMain.handle('delete-record', async (event, plantReadingId) => {
    try {
      const result = await deleteRecords(plantReadingId)
      return result
    } catch (error) {
      console.error('Log Errors', error)
      throw error
    }
  })

  // Get Paginated Data
  ipcMain.handle('get-plant-readings', async (event, page = 1, month = null, year = null) => {
    const data = await getPaginatedReadings(page, month, year)
    return { plant_readings: data }
  })

  // Generate Report from database
  ipcMain.handle('generate-excel', async (event, dates) => {
    const { start, end } = dates
    const readings = getDataUsingDate(start, end)
    await exportToExcel(readings, start, end)
  })

  ipcMain.handle('get-data-using-date', async (event, dates) => {
    const { start, end } = dates
    let orderType = 'DESC'
    if (dates.orderType) orderType = dates.orderType
    const result = await getDataUsingDate(start, end, orderType)
    return result
  })

  // Get first record year
  ipcMain.handle('get-first-record-year', async (event) => {
    const result = await getFirstRecordYear()
    return result
  })

  // Get record by ID
  ipcMain.handle('get-record-by-id', async (event, id) => {
    const result = getRecordById(id)
    return result
  })

  ipcMain.handle('get-tank-by-id', async (event, tankId) => {
    const result = getTankById(tankId)
    return result
  })

  ipcMain.handle('get-all-tank-info', async () => {
    const result = getAllTankInfo()
    return result
  })

  ipcMain.handle('update-tank-info', async (event, tankData) => {
    const result = updateTankInfo(tankData)
    return result
  })

  ipcMain.handle('activate-tanks', async (event, tanks) => {
    const result = activateTanks(tanks)
    return result
  })

  ipcMain.handle('fetch-last-week-data', async (event, tankId) => {
    const result = getLastWeekData(tankId)
    return result
  })
  // getTodaysReadings
  ipcMain.handle('get-todays-readings', async (event) => {
    const result = getTodaysReadings()
    return result
  })

  // Save Graphs
  ipcMain.handle('save-graphs', async (event, fileType, base64Data) => {
    // const result = await saveGraphs(fileType, data)
    // return result

    const result = await dialog.showSaveDialog({
      title: 'Save File',
      defaultPath: path.join(__dirname, `graph.${fileType}`),
      filters: [{ name: fileType.toUpperCase(), extensions: [fileType] }]
    })

    if (!result.canceled && result.filePath) {
      const filePath = result.filePath
      const buffer = Buffer.from(base64Data, 'base64') // Decode base64 to binary
      fs.writeFileSync(filePath, buffer)
    }
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.bluewater')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize Database
  initializeDatabase()

  // Display Window
  const mainWindow = createWindow()

  // Handle Database
  handleIPC()

  // Handle Authentication
  ipcHandleAuth()

  // backup
  monitorAndBackup()

  // Auto Update
  setupAutoUpdater(mainWindow)

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  setRole('guest')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
