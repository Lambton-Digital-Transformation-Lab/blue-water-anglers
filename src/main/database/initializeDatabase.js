import Database from 'better-sqlite3'
import path from 'path'
import crypto from 'crypto'
import { existsSync, mkdirSync } from 'fs'
import { app } from 'electron'

const basePath = path.join(app.getPath('userData'), 'database')

// Define all paths
const mainDbPath = path.join(basePath, 'main_database')
const googleCredsPath = path.join(basePath, 'google_creds_path')
const dbFilePath = path.join(mainDbPath, 'plantDatabase.sqlite')

;[mainDbPath, googleCredsPath].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
})

// Create or open the SQLite database
export const db = new Database(dbFilePath)

export const initializeDatabase = () => {
  // Register the `uuid()` function to generate UUIDs on the database side
  db.function('uuid', () => {
    // NOTE: Node.js 16+ supports crypto.randomUUID()
    return crypto.randomUUID()
  })

  // Create tables if they dont exists
  db.exec(`
      CREATE TABLE IF NOT EXISTS plant_readings (
        id TEXT PRIMARY KEY DEFAULT (uuid()),
        timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        header_pressure_in TEXT DEFAULT '',
        pump_1_active INTEGER DEFAULT 0,
        pump_2_active INTEGER DEFAULT 0,
        pump_3_active INTEGER DEFAULT 0,
        pump_4_active INTEGER DEFAULT 0,
        east_pump_active INTEGER DEFAULT 0,
        east_blower_north_active INTEGER DEFAULT 0,
        west_blower_active INTEGER DEFAULT 0,
        east_blower_south_active INTEGER DEFAULT 0,
        east_well_pressure INTEGER DEFAULT 0,
        water_temperature INTEGER DEFAULT 0,
        east_blower_header_pressure INTEGER DEFAULT 0,
        west_blower_header_pressure INTEGER DEFAULT 0,
        aeration_tank_overflow INTEGER DEFAULT 0,
        diesel_room_temperature INTEGER DEFAULT 0,
        battery_voltage REAL DEFAULT 0.0,
        block_heater_active INTEGER DEFAULT 0,
        generator_autostart INTEGER DEFAULT 0,
        generator_hours INTEGER DEFAULT 0,
        generator_minutes INTEGER DEFAULT 0,
        fuel_tank_level INTEGER DEFAULT 0,
        transfer_switch_active INTEGER DEFAULT 0,
        generator_at_rest INTEGER DEFAULT 0,
        plc_active INTEGER DEFAULT 0,
        alarm_activated INTEGER DEFAULT 0,
        operator_name TEXT DEFAULT 'UNKNOWN'
      );
    
      CREATE TABLE IF NOT EXISTS tanks (
        tank_id TEXT PRIMARY KEY DEFAULT (uuid()),
        tank_active INTEGER DEFAULT 0,
        tank_name TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS fish_types (
          fish_type_id TEXT PRIMARY KEY DEFAULT (uuid()),
          fish_type_name TEXT UNIQUE NOT NULL
      );
    
      CREATE TABLE IF NOT EXISTS tank_snapshots (
        snapshot_id TEXT PRIMARY KEY DEFAULT (uuid()),
        reading_id TEXT,
        tank_id TEXT,
        fish_type_id TEXT,
        number_of_fishes INTEGER DEFAULT 0,
        flow INTEGER DEFAULT 0,
        clean INTEGER DEFAULT 0,
        do_level INTEGER DEFAULT 0,
        food_size TEXT DEFAULT '"0" CRUMB',
        fish_size REAL DEFAULT 0.00,
        diet REAL DEFAULT 0.00,
        diet_type TEXT NOT NULL CHECK (diet_type IN ('L', 'gm')),
        mort INTEGER DEFAULT 0,
        FOREIGN KEY (reading_id) REFERENCES plant_readings(id) ON DELETE CASCADE,
        FOREIGN KEY (tank_id) REFERENCES tanks(tank_id) ON DELETE CASCADE,
        FOREIGN KEY (fish_type_id) REFERENCES fish_types(fish_type_id) ON DELETE SET NULL
        CHECK (food_size IN (
          '"0" CRUMB', '"1" CRUMB', '"2" CRUMB', '#1.2 MM', '#1.5 MM', '#2 MM', '#3 MM FLOAT', '#5 MM FLOAT'
        ))
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_reading_tank ON tank_snapshots(reading_id, tank_id);
      PRAGMA foreign_keys = ON;
    `)
}
