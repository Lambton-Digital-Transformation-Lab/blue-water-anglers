import { useEffect, useState } from 'react'
import { FormField } from '../molecules'
import { TankTable } from '../organisms/TankTable/TankTable'
import { TankForm } from './AddTanks'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Button } from '../atoms'

export const AddRecords = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const today = new Date().toLocaleDateString('en-GB') // DD/MM/YYYY
  const addTanks = location?.state?.addTanks || false

  const [tanks, setTanks] = useState([])
  const [isFormOpen, setIsFormOpen] = useState(addTanks)
  const [editIndex, setEditIndex] = useState(null)

  const [formData, setFormData] = useState({
    header_pressure_in: '',
    pump_1_active: false,
    pump_2_active: false,
    pump_3_active: false,
    pump_4_active: false,
    east_pump_active: false,
    east_blower_north_active: false,
    west_blower_active: false,
    east_blower_south_active: false,
    east_well_pressure: '',
    water_temperature: '',
    east_blower_header_pressure: '',
    west_blower_header_pressure: '',
    aeration_tank_overflow: false,
    diesel_room_temperature: '',
    battery_voltage: '',
    block_heater_active: false,
    generator_autostart: false,
    generator_hours: '',
    generator_minutes: '',
    fuel_tank_level: '',
    transfer_switch_active: false,
    generator_at_rest: false,
    plc_active: false,
    alarm_activated: false,
    operator_name: ''
  })

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        const data = await window.electron.api.getRecordById(id)
        if (data) {
          setFormData(data)
          setTanks(data.tank_snapshots)
        }
      }

      fetchData()
    }
  }, [id])

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAddClick = () => {
    setEditIndex(null)
    setIsFormOpen(true)
  }

  const handleSave = (tankData) => {
    if (editIndex !== null) {
      const updated = [...tanks]
      updated[editIndex] = tankData
      setTanks(updated)
    } else {
      setTanks([...tanks, tankData])
    }
    setIsFormOpen(false)
  }

  const handleEdit = (index) => {
    setEditIndex(index)
    setIsFormOpen(true)
  }

  const handleDelete = (index) => {
    const updated = tanks.filter((_, i) => i !== index)
    setTanks(updated)
  }

  const normalizeValues = (data) => {
    const result = {}
    for (const key in data) {
      const val = data[key]
      result[key] = typeof val === 'boolean' ? (val ? 1 : 0) : val
    }
    return result
  }

  const handleSubmit = async () => {
    formData.tank_snapshots = tanks
    const payload = {
      plant_reading: normalizeValues(formData),
      tanks: tanks.map(normalizeValues)
    }

    try {
      if (id) {
        payload.plant_reading_id = id
        console.log(payload)
        const result = await window.electron.api.editRecords(payload)
        navigate('/')
        console.log(result)
      } else {
        const result = await window.electron.api.insertRecords(payload)
        navigate('/')
        console.log(result)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      {isFormOpen ? (
        <TankForm
          initialData={editIndex !== null ? tanks[editIndex] : {}}
          onSave={handleSave}
          onCancel={() => setIsFormOpen(false)}
        />
      ) : (
        <div className="add-record-container">
          <div className="add-records-container">
            <FormField label="DATE" name="date" value={today} disabled />

            <FormField
              label="HEADER PRESSURE"
              name="header_pressure_in"
              value={formData.header_pressure_in}
              onChange={handleChange}
            />

            <div className="form__pumps-block">
              <FormField
                label="PUMP #1"
                name="pump_1_active"
                type="checkbox"
                value={formData.pump_1_active}
                onChange={handleChange}
              />
              <FormField
                label="PUMP #2"
                name="pump_2_active"
                type="checkbox"
                value={formData.pump_2_active}
                onChange={handleChange}
              />
              <FormField
                label="PUMP #3"
                name="pump_3_active"
                type="checkbox"
                value={formData.pump_3_active}
                onChange={handleChange}
              />
              <FormField
                label="PUMP #4"
                name="pump_4_active"
                type="checkbox"
                value={formData.pump_4_active}
                onChange={handleChange}
              />
              <FormField
                label="EAST PUMP"
                name="east_pump_active"
                type="checkbox"
                value={formData.east_pump_active}
                onChange={handleChange}
              />
            </div>

            <FormField
              label="EAST WELL PRESSURE"
              name="east_well_pressure"
              value={formData.east_well_pressure}
              onChange={handleChange}
            />
            <FormField
              label="WATER TEMPERATURE"
              name="water_temperature"
              value={formData.water_temperature}
              onChange={handleChange}
            />

            <div className="form__blowers-block">
              <FormField
                label="EAST BLOWER NORTH"
                name="east_blower_north_active"
                type="checkbox"
                value={formData.east_blower_north_active}
                onChange={handleChange}
              />
              <FormField
                label="WEST BLOWER"
                name="west_blower_active"
                type="checkbox"
                value={formData.west_blower_active}
                onChange={handleChange}
              />
              <FormField
                label="EAST BLOWER SOUTH"
                name="east_blower_south_active"
                type="checkbox"
                value={formData.east_blower_south_active}
                onChange={handleChange}
              />
            </div>

            <FormField
              label="EAST BLOWER HEADER PRESSURE"
              name="east_blower_header_pressure"
              value={formData.east_blower_header_pressure}
              onChange={handleChange}
            />
            <FormField
              label="WEST BLOWER HEADER PRESSURE"
              name="west_blower_header_pressure"
              value={formData.west_blower_header_pressure}
              onChange={handleChange}
            />

            <FormField
              label="AERATION TANK OVERFLOW"
              name="aeration_tank_overflow"
              type="checkbox"
              value={formData.aeration_tank_overflow}
              onChange={handleChange}
            />

            <FormField
              label="DIESEL ROOM TEMPERATURE"
              name="diesel_room_temperature"
              value={formData.diesel_room_temperature}
              onChange={handleChange}
            />
            <FormField
              label="BATTERY VOLTAGE"
              name="battery_voltage"
              value={formData.battery_voltage}
              onChange={handleChange}
            />

            <div className="form__generator-block">
              <FormField
                label="BLOCK HEATER ACTIVE"
                name="block_heater_active"
                type="checkbox"
                value={formData.block_heater_active}
                onChange={handleChange}
              />
              <FormField
                label="GENERATOR AUTOSTART"
                name="generator_autostart"
                type="checkbox"
                value={formData.generator_autostart}
                onChange={handleChange}
              />
            </div>

            <div>
              <FormField
                label="GENERATOR HOURS"
                name="generator_hours"
                value={formData.generator_hours}
                onChange={handleChange}
              />
              <FormField
                label="GENERATOR MINUTES"
                name="generator_minutes"
                value={formData.generator_minutes}
                onChange={handleChange}
              />
            </div>

            <FormField
              label="FUEL TANK LEVEL"
              name="fuel_tank_level"
              value={formData.fuel_tank_level}
              onChange={handleChange}
            />

            <div className="form__control-block">
              <FormField
                label="TRANSFER SWITCH ACTIVE"
                name="transfer_switch_active"
                type="checkbox"
                value={formData.transfer_switch_active}
                onChange={handleChange}
              />
              <FormField
                label="GENERATOR AT REST"
                name="generator_at_rest"
                type="checkbox"
                value={formData.generator_at_rest}
                onChange={handleChange}
              />
              <FormField
                label="PLC ACTIVE"
                name="plc_active"
                type="checkbox"
                value={formData.plc_active}
                onChange={handleChange}
              />
              <FormField
                label="ALARM ACTIVATED"
                name="alarm_activated"
                type="checkbox"
                value={formData.alarm_activated}
                onChange={handleChange}
              />
            </div>

            <FormField
              label="OPERATOR NAME"
              name="operator_name"
              value={formData.operator_name}
              onChange={handleChange}
            />

            <div className="form__button-container">
              <Button onClick={handleSubmit}>Save</Button>
              <Button onClick={() => navigate('/')}>Exit</Button>
            </div>
          </div>

          <div className="add-tanks-container">
            <Button onClick={handleAddClick}>Add Tank</Button>
            <Button onClick={() => navigate('/activateTanks')}>Activate Tanks</Button>
            <TankTable tanks={tanks} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        </div>
      )}
    </div>
  )
}
