const fs = require('fs')
const XLSX = require('xlsx')
const { dialog } = require('electron')

/**
 * Generates an Excel file with plant readings and tank snapshots with tank names.
 * @param {Array} plantReadings - Array of plant readings, each with nested tank_snapshots that include tank_name.
 * @param {String} startDate - Start date in ISO format.
 * @param {String} endDate - End date in ISO format.
 */
export const exportToExcel = async (plantReadings, startDate, endDate) => {
  const workbook = XLSX.utils.book_new()

  // Flatten plant readings, exclude tank_snapshots
  const readingsFlat = plantReadings.map(
    ({
      tank_snapshots,
      timestamp,
      pump_1_active,
      pump_2_active,
      pump_3_active,
      pump_4_active,
      east_pump_active,
      east_blower_north_active,
      west_blower_active,
      east_blower_south_active,
      aeration_tank_overflow,
      block_heater_active,
      generator_autostart,
      generator_hours,
      generator_minutes,
      transfer_switch_active,
      generator_at_rest,
      plc_active,
      alarm_activated,
      water_temperature,
      battery_voltage,
      diesel_room_temperature,
      fuel_tank_level,
      header_pressure_in,
      east_well_pressure,
      east_blower_header_pressure,
      west_blower_header_pressure,
      id,
      ...rest
    }) => {
      return {
        timestamp,
        'Header Pressure In': header_pressure_in,
        'Pump 1 Active': pump_1_active === 1 ? 'ON' : 'OFF',
        'Pump 2 Active': pump_2_active === 1 ? 'ON' : 'OFF',
        'Pump 3 Active': pump_3_active === 1 ? 'ON' : 'OFF',
        'Pump 4 Active': pump_4_active === 1 ? 'ON' : 'OFF',
        'East Pump Active': east_pump_active === 1 ? 'ON' : 'OFF',
        'East Well Pressure': east_well_pressure,
        'Water Temperature': Number(water_temperature).toFixed(1),
        east_blower_north_active: east_blower_north_active === 1 ? 'ON' : 'OFF',
        east_blower_south_active: east_blower_south_active === 1 ? 'ON' : 'OFF',
        west_blower_active: west_blower_active === 1 ? 'ON' : 'OFF',
        'East Blower Header Pressure': east_blower_header_pressure,
        'West Blower Header Pressure': west_blower_header_pressure,
        aeration_tank_overflow: aeration_tank_overflow === 1 ? 'ON' : 'OFF',
        diesel_room_temperature: Number(diesel_room_temperature).toFixed(1),
        battery_voltage: Number(battery_voltage).toFixed(1),
        block_heater_active: block_heater_active === 1 ? 'ON' : 'OFF',
        generator_autostart: generator_autostart === 1 ? 'ON' : 'OFF',
        generator_hours: `${generator_hours} h / ${generator_minutes} m`,
        fuel_tank_level: `${fuel_tank_level} %`,
        transfer_switch_active: transfer_switch_active === 1 ? 'ON' : 'OFF',
        generator_at_rest: generator_at_rest === 1 ? 'TRUE' : 'FALSE',
        plc_active: plc_active === 1 ? 'TRUE' : 'FALSE',
        alarm_activated: alarm_activated === 1 ? 'ON' : 'OFF',
        ...rest
      }
    }
  )
  const readingsSheet = XLSX.utils.json_to_sheet(readingsFlat)

  // Get headers
  const headers = Object.keys(readingsFlat[0])

  // Calculate max width for each column
  const colWidths = headers.map((header) => {
    let maxLen = header.length
    for (const row of readingsFlat) {
      const cellValue = row[header]
      const cellText = cellValue ? cellValue.toString() : ''
      if (cellText.length > maxLen) {
        maxLen = cellText.length
      }
    }
    return { wch: maxLen + 2 } // +2 for padding
  })

  // Apply column widths
  readingsSheet['!cols'] = colWidths

  XLSX.utils.book_append_sheet(workbook, readingsSheet, 'Plant Readings')

  // Flatten all snapshots with reading_id and tank_name
  const allSnapshots = plantReadings.flatMap((reading) =>
    (reading.tank_snapshots || []).map((snapshot) => ({
      timestamp: reading.timestamp,
      ...snapshot
    }))
  )

  const snapshotCleanUp = allSnapshots.map(
    ({
      snapshot_id,
      reading_id,
      tank_id,
      tank_name,
      flow,
      clean,
      timestamp,
      fish_size,
      food_size,
      diet,
      ...rest
    }) => {
      return {
        timestamp,
        tank_name,
        flow: flow === 1 ? 'TRUE' : 'FALSE',
        clean: clean === 1 ? 'TRUE' : 'FALSE',
        'Fish Size': Number(fish_size).toFixed(2),
        'Food Size': food_size,
        Diet: Number(diet).toFixed(2),
        ...rest
      }
    }
  )

  const snapshotsSheet = XLSX.utils.json_to_sheet(snapshotCleanUp)

  const snapshotHeaders = Object.keys(snapshotCleanUp[0])

  const snapshotColWidths = snapshotHeaders.map((header) => {
    let maxLen = header.length
    for (const row of snapshotCleanUp) {
      const cellValue = row[header]
      const cellText = cellValue ? cellValue.toString() : ''
      if (cellText.length > maxLen) {
        maxLen = cellText.length
      }
    }
    return { wch: maxLen + 2 }
  })

  snapshotsSheet['!cols'] = snapshotColWidths

  XLSX.utils.book_append_sheet(workbook, snapshotsSheet, 'Tank Snapshots')

  function formatDate(date) {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0') // Months are zero-based
    const year = d.getFullYear()
    return `${day}_${month}_${year}`
  }

  // Assuming startDate and endDate are already defined as Date objects
  const startDateFormatted = formatDate(startDate)
  const endDateFormatted = formatDate(endDate)

  // Prompt user to save with formatted dates
  const { filePath } = await dialog.showSaveDialog({
    title: `BLUEWATER ANGLERS REPORT - ${startDateFormatted} TO ${endDateFormatted}`,
    defaultPath: `bluewater_report_${startDateFormatted}_${endDateFormatted}.xlsx`,
    filters: [{ name: 'Excel Workbook', extensions: ['xlsx'] }]
  })

  if (filePath) {
    XLSX.writeFile(workbook, filePath)
  }
}

module.exports = { exportToExcel }
