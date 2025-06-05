import path from 'path'
const { dialog } = require('electron')
const fs = require('fs')

export const saveGraphs = async (fileType, data) => {
  const result = await dialog.showSaveDialog({
    title: 'Save File',
    defaultPath: path.join(__dirname, `graph.${fileType}`),
    filters: [{ name: fileType.toUpperCase(), extensions: [fileType] }]
  })

  if (!result.canceled && result.filePath) {
    const filePath = result.filePath

    if (fileType === 'png') {
      const buffer = Buffer.from(data, 'base64') // Decode base64 data to binary
      fs.writeFileSync(filePath, buffer)
    } else if (fileType === 'pdf') {
      const buffer = Buffer.from(data, 'base64') // Decode base64 data to binary
      fs.writeFileSync(filePath, buffer)
    }
  }
}
