import { db } from '../initializeDatabase'

export const editRecords = (readingData) => {
  const { plant_reading, tanks, plant_reading_id } = readingData

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
    // Update plant reading
    db.prepare(
      `
      UPDATE plant_readings SET
        header_pressure_in = ?, pump_1_active = ?, pump_2_active = ?, pump_3_active = ?, pump_4_active = ?,
        east_pump_active = ?, east_blower_north_active = ?, west_blower_active = ?, east_blower_south_active = ?,
        east_well_pressure = ?, water_temperature = ?, east_blower_header_pressure = ?, west_blower_header_pressure = ?,
        aeration_tank_overflow = ?, diesel_room_temperature = ?, battery_voltage = ?, block_heater_active = ?,
        generator_autostart = ?, generator_hours = ?, generator_minutes = ?, fuel_tank_level = ?,
        transfer_switch_active = ?, generator_at_rest = ?, plc_active = ?, alarm_activated = ?, operator_name = ?
      WHERE id = ?
    `
    ).run(
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
      operator_name,
      plant_reading_id
    )

    // Update tank snapshots and ensure tanks are handled correctly
    const updatedTankIds = []

    for (const tank of tanks) {
      if (!tank.tank_name || !tank.fish_type_name) {
        throw new Error(`Missing tank_name or fish_type_name in tank: ${JSON.stringify(tank)}`)
      }

      // Ensure tank exists
      const existingTank = db
        .prepare(`SELECT tank_id FROM tanks WHERE tank_name = ?`)
        .get(tank.tank_name)
      const tankId = existingTank
        ? existingTank.tank_id
        : db
            .prepare(`INSERT INTO tanks (tank_name) VALUES (?) RETURNING tank_id`)
            .get(tank.tank_name).tank_id

      // Ensure fish type exists
      const existingFish = db
        .prepare(`SELECT fish_type_id FROM fish_types WHERE fish_type_name = ?`)
        .get(tank.fish_type_name)
      const fishId = existingFish
        ? existingFish.fish_type_id
        : db
            .prepare(`INSERT INTO fish_types (fish_type_name) VALUES (?) RETURNING fish_type_id`)
            .get(tank.fish_type_name).fish_type_id

      // update snapshot if it exists
      const existingSnapshot = db
        .prepare(
          `
        SELECT * FROM tank_snapshots
        WHERE reading_id = ? AND tank_id = ?
      `
        )
        .get(plant_reading_id, tankId)

      if (existingSnapshot) {
        db.prepare(
          `
          UPDATE tank_snapshots SET
            fish_type_id = ?, number_of_fishes = ?, flow = ?, clean = ?, do_level = ?,
            food_size = ?, fish_size = ?, diet = ?, diet_type = ?, mort = ?
          WHERE reading_id = ? AND tank_id = ?
        `
        ).run(
          fishId,
          tank.number_of_fishes || 0,
          tank.flow || 0,
          tank.clean || 0,
          tank.do_level || 0,
          tank.food_size || 0.0,
          tank.fish_size || 0.0,
          tank.diet || 0.0,
          tank.diet_type || 'L',
          tank.mort || 0,
          plant_reading_id,
          tankId
        )
      } else {
        db.prepare(
          `
          INSERT INTO tank_snapshots (
            reading_id, tank_id, fish_type_id, number_of_fishes, flow, clean, do_level,
            food_size, fish_size, diet, diet_type, mort
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
        ).run(
          plant_reading_id,
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

      updatedTankIds.push(tankId)
    }

    // Delete tank snapshots for deleted tanks
    const placeholders = updatedTankIds.map(() => '?').join(', ')
    db.prepare(
      `
      DELETE FROM tank_snapshots
      WHERE reading_id = ? AND tank_id NOT IN (${placeholders})
    `
    ).run([plant_reading_id, ...updatedTankIds])

    db.prepare('COMMIT').run()
    return { success: true, message: 'Plant reading and tank data updated successfully' }
  } catch (error) {
    db.prepare('ROLLBACK').run()
    console.error('Error during update transaction:', error)
    return { success: false, message: 'Update failed', error }
  }
}

export const updateTankInfo = (tankData) => {
  try {
    db.prepare('BEGIN TRANSACTION').run()

    const updateStmt = db.prepare(`
      UPDATE tanks SET
      tank_name = ?, tank_active = ?
      WHERE tank_id = ?
    `)

    updateStmt.run(tankData.tank_name, tankData.tank_active, tankData.tank_id)
    db.prepare('COMMIT').run()
    return { success: true, message: 'Updated tank info successfully.' }
  } catch (error) {
    db.prepare('ROLLBACK').run()

    return { success: false, error: error.message }
  }
}

export const activateTanks = (tanks) => {
  try {
    db.prepare('BEGIN TRANSACTION').run() 

    // Loop through each tank and update its active status
    const updateStmt = db.prepare(`
      UPDATE tanks SET
        tank_active = ?
      WHERE tank_id = ?
    `)

    // Update each tank's status
    tanks.forEach((tank) => {
      updateStmt.run(tank.tank_active ? 1 : 0, tank.tank_id)
    })

    // Commit the transaction after all updates
    db.prepare('COMMIT').run()

    return { success: true, message: `${tanks.length} tanks updated successfully.` }
  } catch (error) {
    db.prepare('ROLLBACK').run()

    console.error('Error during batch tank activation:', error)
    return { success: false, error: error.message }
  }
}
