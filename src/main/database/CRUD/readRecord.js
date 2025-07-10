import { db } from '../initializeDatabase'

export const getTotalNumberOfPages = (tableName) => {
  const result = db
    .prepare(
      `
      SELECT COUNT(*) as count
      FROM ${tableName}
    `
    )
    .get()

  return result.count
}

export const getPaginatedReadings = (page = 1, month = null, year = null, pageSize = 5) => {
  const offset = (page - 1) * pageSize

  // Base query parts
  let whereClause = ''
  const params = []

  // Apply filter if both month and year are provided
  if (month && year) {
    whereClause = `WHERE strftime('%m', timestamp) = ? AND strftime('%Y', timestamp) = ?`
    params.push(String(month).padStart(2, '0'), String(year))
  }

  // Add pagination
  const paginationQuery = `
    SELECT * FROM plant_readings
    ${whereClause}
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?
  `

  // Add pagination params
  params.push(pageSize, offset)

  // Get the plant_readings (filtered + paginated)
  const readings = db.prepare(paginationQuery).all(...params)

  // Get all reading_ids from current page
  const readingIds = readings.map((r) => r.id)

  if (readingIds.length === 0) return []

  // Get all related tank_snapshots
  const placeholders = readingIds.map(() => '?').join(',')
  const snapshots = db
    .prepare(
      `
      SELECT 
        ts.*, 
        t.tank_name,
        ft.fish_type_name
      FROM tank_snapshots ts
      LEFT JOIN tanks t ON ts.tank_id = t.tank_id
      LEFT JOIN fish_types ft ON ts.fish_type_id = ft.fish_type_id
      WHERE ts.reading_id IN (${placeholders})
    `
    )
    .all(...readingIds)

  // Group snapshots by reading_id
  const snapshotsByReading = {}
  snapshots.forEach((snapshot) => {
    if (!snapshotsByReading[snapshot.reading_id]) {
      snapshotsByReading[snapshot.reading_id] = []
    }
    snapshotsByReading[snapshot.reading_id].push(snapshot)
  })

  // Attach snapshots to readings
  const result = readings.map((reading) => ({
    ...reading,
    tank_snapshots: snapshotsByReading[reading.id] || []
  }))

  return result
}

export const getDataUsingDate = (start, end, orderType = 'DESC') => {
  // Get the plant_readings within the date range
  const readings = db
    .prepare(
      `
      SELECT * FROM plant_readings
      WHERE timestamp BETWEEN ? AND ?
      ORDER BY timestamp ${orderType}
    `
    )
    .all(start, end)

  // Get all reading_ids
  const readingIds = readings.map((r) => r.id)

  if (readingIds.length === 0) return []

  // Get all related tank_snapshots with tank name
  const snapshots = db
    .prepare(
      `
           SELECT 
        ts.*, 
        t.tank_name,
        ft.fish_type_name
      FROM tank_snapshots ts
      LEFT JOIN tanks t ON ts.tank_id = t.tank_id
      LEFT JOIN fish_types ft ON ts.fish_type_id = ft.fish_type_id
      WHERE ts.reading_id IN (${readingIds.map(() => '?').join(',')})
    `
    )
    .all(...readingIds)

  // Group snapshots by reading_id
  const snapshotsByReading = {}
  snapshots.forEach((snapshot) => {
    if (!snapshotsByReading[snapshot.reading_id]) {
      snapshotsByReading[snapshot.reading_id] = []
    }
    snapshotsByReading[snapshot.reading_id].push(snapshot)
  })

  // Attach snapshots to readings
  const result = readings.map((reading) => ({
    ...reading,
    tank_snapshots: snapshotsByReading[reading.id] || []
  }))

  return result
}

export const getRecordById = (id) => {
  // Get the plant_reading by the given id
  const reading = db
    .prepare(
      `
      SELECT * FROM plant_readings
      WHERE id = ?
      `
    )
    .get(id)

  // If no record is found, return null
  if (!reading) return null

  // Get all related tank_snapshots with tank name and fish type name
  const snapshots = db
    .prepare(
      `
      SELECT 
        ts.*, 
        t.tank_name,
        ft.fish_type_name
      FROM tank_snapshots ts
      LEFT JOIN tanks t ON ts.tank_id = t.tank_id
      LEFT JOIN fish_types ft ON ts.fish_type_id = ft.fish_type_id
      WHERE ts.reading_id = ?
      `
    )
    .all(id)

  // Attach snapshots to the reading
  const result = {
    ...reading,
    tank_snapshots: snapshots
  }

  return result
}

export const getTankById = (tankId) => {
  const tankInfo = db
    .prepare(
      `
      SELECT * FROM tanks
      WHERE tank_id = ?
    `
    )
    .get(tankId)

  if (!tankInfo) return null

  // Get distinct fish types associated with this tank via tank_snapshots
  const fishTypes = db
    .prepare(
      `
      SELECT DISTINCT ft.fish_type_id, ft.fish_type_name
      FROM tank_snapshots ts
      JOIN fish_types ft ON ts.fish_type_id = ft.fish_type_id
      WHERE ts.tank_id = ?
    `
    )
    .all(tankId)

  tankInfo.fish_type_name = fishTypes

  return {
    tank: tankInfo
  }
}

export const getAllTankInfo = () => {
  const AllTanks = db.prepare('SELECT * FROM TANKS').all()
  return AllTanks
}

export const getLastWeekData = (tankId) => {
  const query = `
  SELECT 
      ts.food_size, 
      ts.fish_size, 
      ts.number_of_fishes, 
      ft.fish_type_name
  FROM tank_snapshots ts
  INNER JOIN plant_readings pr ON ts.reading_id = pr.id
  INNER JOIN fish_types ft ON ts.fish_type_id = ft.fish_type_id
  WHERE ts.tank_id = ?
  ORDER BY pr.timestamp DESC
  LIMIT 1;
  `

  const result = db.prepare(query).get(tankId)

  if (result) {
    return {
      food_size: result.food_size || '',
      fish_size: result.fish_size || '',
      number_of_fishes: result.number_of_fishes || '',
      fish_type_name: result.fish_type_name || ''
    }
  }

  return { food_size: '', fish_size: '', number_of_fishes: '', fish_type_name: '' }
}

export const getTodaysReadings = () => {
  // Format today’s date in YYYY-MM-DD
  const today = new Date().toISOString().slice(0, 10)

  // Query for today's plant readings
  const readings = db
    .prepare(
      `
      SELECT * FROM plant_readings
      WHERE DATE(timestamp) = ?
      ORDER BY timestamp DESC
    `
    )
    .all(today)

  // Extract reading IDs
  const readingIds = readings.map((r) => r.id)

  if (readingIds.length === 0) return []

  // Query related tank_snapshots
  const placeholders = readingIds.map(() => '?').join(',')
  const snapshots = db
    .prepare(
      `
      SELECT 
        ts.*, 
        t.tank_name,
        ft.fish_type_name
      FROM tank_snapshots ts
      LEFT JOIN tanks t ON ts.tank_id = t.tank_id
      LEFT JOIN fish_types ft ON ts.fish_type_id = ft.fish_type_id
      WHERE ts.reading_id IN (${placeholders})
    `
    )
    .all(...readingIds)

  // Group snapshots by reading_id
  const snapshotsByReading = {}
  snapshots.forEach((snapshot) => {
    if (!snapshotsByReading[snapshot.reading_id]) {
      snapshotsByReading[snapshot.reading_id] = []
    }
    snapshotsByReading[snapshot.reading_id].push(snapshot)
  })

  // Attach snapshots to readings
  const result = readings.map((reading) => ({
    ...reading,
    tank_snapshots: snapshotsByReading[reading.id] || []
  }))

  return result
}

export const getFirstRecordYear = () => {
  const query = `
    SELECT timestamp 
    FROM plant_readings 
    ORDER BY timestamp ASC 
    LIMIT 1
  `

  const result = db.prepare(query).get()

  return result ? result.timestamp : null
}
