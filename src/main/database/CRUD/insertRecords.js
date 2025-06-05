import { db } from '../initializeDatabase'

// Create a new plant reading, add tanks and their snapshots
export const insertRecords = (readingData) => {
  const { plant_reading, tanks } = readingData

  const {
    header_pressure_in,
    pump_1_active,
    pump_2_active,
    pump_3_active,
    pump_4_active,
    east_pump_active,
    east_blower_north_active,
    west_blower_active,
    east_blower_south_active,
    east_well_pressure,
    water_temperature,
    east_blower_header_pressure,
    west_blower_header_pressure,
    aeration_tank_overflow,
    diesel_room_temperature,
    battery_voltage,
    block_heater_active,
    generator_autostart,
    generator_hours,
    generator_minutes,
    fuel_tank_level,
    transfer_switch_active,
    generator_at_rest,
    plc_active,
    alarm_activated,
    operator_name
  } = plant_reading

  db.prepare('BEGIN TRANSACTION').run()

  try {
    // Insert the plant reading into plant_readings table
    const stmt = db.prepare(`
      INSERT INTO plant_readings (
        header_pressure_in, pump_1_active, pump_2_active, pump_3_active, pump_4_active,
        east_pump_active, east_blower_north_active, west_blower_active, east_blower_south_active,
        east_well_pressure, water_temperature, east_blower_header_pressure, west_blower_header_pressure,
        aeration_tank_overflow, diesel_room_temperature, battery_voltage, block_heater_active,
        generator_autostart, generator_hours, generator_minutes, fuel_tank_level,
        transfer_switch_active, generator_at_rest, plc_active, alarm_activated, operator_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id
    `)

    const result = stmt.get(
      header_pressure_in,
      pump_1_active,
      pump_2_active,
      pump_3_active,
      pump_4_active,
      east_pump_active,
      east_blower_north_active,
      west_blower_active,
      east_blower_south_active,
      east_well_pressure,
      water_temperature,
      east_blower_header_pressure,
      west_blower_header_pressure,
      aeration_tank_overflow,
      diesel_room_temperature,
      battery_voltage,
      block_heater_active,
      generator_autostart,
      generator_hours,
      generator_minutes,
      fuel_tank_level,
      transfer_switch_active,
      generator_at_rest,
      plc_active,
      alarm_activated,
      operator_name
    )

    let plantReadingId = result.id

    // Insert tanks if they don't already exist
    const tankIds = []
    const fishIds = []

    for (let tank of tanks) {
      // Check if the tank already exists
      const checkStmt = db.prepare(`SELECT tank_id FROM tanks WHERE tank_name = ?`)
      const existingTank = checkStmt.get(tank.tank_name)
      let tankId

      const checkFishStmt = db.prepare(
        `SELECT fish_type_id from fish_types WHERE fish_type_name = ?`
      )
      const existingFish = checkFishStmt.get(tank.fish_type_name)
      let fishId

      if (existingTank) {
        // If the tank exists use the existing tank ID
        tankId = existingTank.tank_id
      } else {
        // If the tank doesn't exist insert it into the tanks table
        const insertTankStmt = db.prepare(
          `INSERT INTO tanks (tank_name) VALUES (?) RETURNING tank_id`
        )
        const insertResult = insertTankStmt.get(tank.tank_name)
        tankId = insertResult.tank_id
      }

      tankIds.push(tankId)

      if (existingFish) {
        fishId = existingFish.fish_type_id
      } else {
        const insertNewFishStmt = db.prepare(
          `INSERT INTO fish_types (fish_type_name) VALUES (?) RETURNING fish_type_id`
        )
        const insertFishResult = insertNewFishStmt.get(tank.fish_type_name)
        fishId = insertFishResult.fish_type_id
      }

      fishIds.push(fishId)
    }

    // Insert tank snapshots for each tank
    for (let i = 0; i < tanks.length; i++) {
      const tank = tanks[i]
      const tankId = tankIds[i]
      const fishId = fishIds[i]

      const insertSnapshotStmt = db.prepare(`
        INSERT INTO tank_snapshots (
          reading_id, tank_id, fish_type_id, number_of_fishes, flow, clean, do_level, food_size, fish_size, diet, diet_type, mort
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      insertSnapshotStmt.run(
        plantReadingId,
        tankId,
        fishId,
        tank.number_of_fishes || 0,
        tank.flow || 0,
        tank.clean || 0,
        tank.do_level || 0,
        tank.food_size || 0.0,
        tank.fish_size || 0.0,
        tank.diet || 0.0,
        tank.diet_type || 'L',
        tank.mort || 0
      )
    }

    // Commit the transaction if everything is successful
    db.prepare('COMMIT').run()
    return { success: true, message: 'Plant reading, tanks, and snapshots inserted successfully' }
  } catch (error) {
    db.prepare('ROLLBACK').run()
    console.error('Error during transaction:', error)
    return error
  }
}

export const insertTanks = (tankName, tankActive) => {
  try {
    db.prepare('BEGIN TRANSACTION').run()

    let tankId = insertTankLogic(tankName, tankActive)

    if (!tankId) throw new Error('Tank ID is null')

    db.prepare('COMMIT').run() // Commit the transaction after insertion

    return { success: true, message: 'Tank Name inserted successfully' }
  } catch (error) {
    db.prepare('ROLLBACK').run() // Rollback on failure

    console.error('Error during transaction:', error)
    return { success: false, message: error.message }
  }
}

const insertTankLogic = (tankName, tankActive) => {
  const checkStmt = db.prepare('SELECT tank_id FROM tanks WHERE tank_name = ?')
  const existingTank = checkStmt.get(tankName)
  let tankId = null

  if (existingTank) {
    // If the tank exists, update it
    tankId = existingTank.tank_id
    const updateTankStmt = db.prepare('UPDATE tanks SET tank_active = ? WHERE tank_id = ?')
    updateTankStmt.run(tankActive, tankId)
  } else {
    // If the tank doesn't exist, insert it
    const insertTankStmt = db.prepare(
      'INSERT INTO tanks (tank_name, tank_active) VALUES (?, ?) RETURNING tank_id'
    )
    const insertResult = insertTankStmt.get(tankName, tankActive)
    tankId = insertResult.tank_id
  }

  return tankId
}

export const insertFishTypes = (fishName) => {
  db.prepare('BEGIN TRANSACTION').run()

  let fishId = null

  try {
    const insertNewFishStmt = db.prepare(
      `INSERT INTO fish_types (fish_type_name) VALUES (?) RETURNING fish_type_id`
    )
    const insertFishResult = insertNewFishStmt.get(fishName)
    fishId = insertFishResult.fish_type_id
    if (!fishId) throw new Error('Fish ID is null')
    return { success: true, message: `${fishName} has been added to the database` }
  } catch (error) {
    db.prepare('ROLLBACK').run()
    return error
  }
}
