// preload.js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    send: (channel, ...args) => ipcRenderer.send(channel, ...args)
  },
  api: {
    insertRecords: async (readingData) => {
      return ipcRenderer.invoke('insert-records', readingData)
    },
    insertTanks: async (tankName, tankActive) => {
      return ipcRenderer.invoke('insert-tanks', tankName, tankActive)
    },
    editRecords: async (readingData) => {
      return ipcRenderer.invoke('edit-records', readingData)
    },
    deleteRecords: async (readingData) => {
      return ipcRenderer.invoke('delete-record', readingData)
    },
    getPlantReadings: async (page, month = null, year = null) => {
      return ipcRenderer.invoke('get-plant-readings', page, month, year)
    },
    generateExcel: async (dates) => {
      return ipcRenderer.invoke('generate-excel', dates)
    },
    getDataUsingDate: async (dates) => {
      return ipcRenderer.invoke('get-data-using-date', dates)
    },
    getRecordById: async (id) => {
      return ipcRenderer.invoke('get-record-by-id', id)
    },
    getTankById: async (tankId) => {
      return ipcRenderer.invoke('get-tank-by-id', tankId)
    },
    getAllTankInfo: async () => {
      return ipcRenderer.invoke('get-all-tank-info')
    },
    getTotalNumberOfPages: async (tankName) => {
      return ipcRenderer.invoke('get-total-number-of-pages', tankName)
    },
    updateTankInfo: async (tankData) => {
      return ipcRenderer.invoke('update-tank-info', tankData)
    },
    activateTanks: async (tanks) => {
      return ipcRenderer.invoke('activate-tanks', tanks)
    },
    getLastWeekData: async (tankId) => {
      return ipcRenderer.invoke('fetch-last-week-data', tankId)
    },
    getTodaysReadings: async () => {
      return ipcRenderer.invoke('get-todays-readings')
    },
    saveGraphs: async (fileType, base64Data) => {
      return ipcRenderer.invoke('save-graphs', fileType, base64Data)
    },
    getFirstRecordYear: async () => {
      return ipcRenderer.invoke('get-first-record-year')
    }
  },
  auth: {
    login: (password) => {
      return ipcRenderer.invoke('auth:login', password)
    },
    logout: () => {
      return ipcRenderer.invoke('auth:logout')
    },
    getRole: () => {
      return ipcRenderer.invoke('auth:getRole')
    }
  }
})
