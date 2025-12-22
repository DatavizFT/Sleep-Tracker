import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { sleepStore, moodStore, agendaStore } from './store'
import type { SleepEntry, MoodEntry, AgendaEntry } from '../renderer/types'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f172a',
  })

  // En développement, charger depuis le serveur Vite
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // En production, charger le fichier HTML buildé
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Handlers IPC pour les données de sommeil
ipcMain.handle('sleep:getAll', () => {
  return sleepStore.getAll()
})

ipcMain.handle('sleep:save', (_event, entry: SleepEntry) => {
  sleepStore.save(entry)
  return { success: true }
})

ipcMain.handle('sleep:update', (_event, id: string, data: Partial<SleepEntry>) => {
  sleepStore.update(id, data)
  return { success: true }
})

ipcMain.handle('sleep:delete', (_event, id: string) => {
  sleepStore.delete(id)
  return { success: true }
})

ipcMain.handle('sleep:getByDateRange', (_event, startDate: string, endDate: string) => {
  return sleepStore.getByDateRange(startDate, endDate)
})

// Handlers IPC pour les données d'humeur
ipcMain.handle('mood:getAll', () => {
  return moodStore.getAll()
})

ipcMain.handle('mood:save', (_event, entry: MoodEntry) => {
  moodStore.save(entry)
  return { success: true }
})

ipcMain.handle('mood:update', (_event, id: string, data: Partial<MoodEntry>) => {
  moodStore.update(id, data)
  return { success: true }
})

ipcMain.handle('mood:delete', (_event, id: string) => {
  moodStore.delete(id)
  return { success: true }
})

// Handlers IPC pour les données d'agenda
ipcMain.handle('agenda:getAll', () => {
  return agendaStore.getAll()
})

ipcMain.handle('agenda:save', (_event, entry: AgendaEntry) => {
  agendaStore.save(entry)
  return { success: true }
})

ipcMain.handle('agenda:update', (_event, id: string, data: Partial<AgendaEntry>) => {
  agendaStore.update(id, data)
  return { success: true }
})

ipcMain.handle('agenda:delete', (_event, id: string) => {
  agendaStore.delete(id)
  return { success: true }
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
