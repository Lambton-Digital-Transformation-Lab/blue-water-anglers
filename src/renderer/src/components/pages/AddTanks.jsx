import { useState, useEffect } from 'react'
import { FormField } from '../molecules'
import { Button, Dropdown, Labels } from '../atoms'
import { Select } from '../atoms/Inputs'

const foodOptions = [
  '"0" CRUMB',
  '"1" CRUMB',
  '"2" CRUMB',
  '#1.2 MM',
  '#1.5 MM',
  '#2 MM',
  '#3 MM FLOAT',
  '#5 MM FLOAT'
]
const dietTypes = ['gm', 'L']

const fishType = ['Salmon', 'Brown Trout', 'Rainbow Trout']

export const TankForm = ({ initialData = {}, onSave, onCancel }) => {
  const [tankData, setTankData] = useState({
    tank_name: '',
    tank_id: '',
    fish_type_name: '',
    number_of_fishes: 0,
    flow: false,
    clean: false,
    do_level: '',
    food_size: '',
    fish_size: '',
    diet: '',
    diet_type: '',
    mort: '',
    ...initialData
  })

  // State to determine if it's Tuesday
  const [isTuesday, setIsTuesday] = useState(false)

  const [isAdmin, setIsAdmin] = useState(false)
  const [loader, setLoader] = useState(false)
  const [activeTanks, setActiveTanks] = useState([])
  const [selectedTank, setSelectedTank] = useState('')

  // Function to fetch last week's data
  const fetchLastWeekData = async (tankId) => {
    const response = await window.electron.api.getLastWeekData(tankId)
    if (response && response.data) {
      return response.data
    }
    return { food_size: '', fish_size: '' }
  }

  // Check if today is Tuesday
  useEffect(() => {
    fetchUserRole()
    const today = new Date().getDay()
    setIsTuesday(today === 2)

    // Fetch all tanks from the DB and filter active tanks
    const fetchTankNames = async () => {
      const response = await window.electron.api.getAllTankInfo()
      setActiveTanks(response)
      const active = response.filter((tank) => tank.tank_active === 1)
      setActiveTanks(active.map((tank) => ({ tank_name: tank.tank_name, tank_id: tank.tank_id })))
    }

    fetchTankNames()
  }, [])

  // Fetch user role
  const fetchUserRole = async () => {
    setLoader(true)
    const role = await window.electron.auth.getRole()
    if (role === 'admin') setIsAdmin(true)
    setLoader(false)
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target
    if (name === 'tank_name') {
      // Update tank_id and tank_name when a new tank is selected
      const selectedTank = activeTanks.find((tank) => tank.tank_name === value)
      setTankData((prev) => ({
        ...prev,
        tank_name: value,
        tank_id: selectedTank ? selectedTank.tank_id : ''
      }))
    } else {
      setTankData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  // Fetch last week's data whenever the selected tank changes (based on tank_id)
  useEffect(() => {
    const fetchLastWeekValues = async () => {
      if (tankData.tank_id) {
        const lastWeekData = await window.electron.api.getLastWeekData(tankData.tank_id)

        setTankData((prevData) => ({
          ...prevData,
          food_size: lastWeekData.food_size,
          fish_size: lastWeekData.fish_size
        }))
      }
    }

    fetchLastWeekValues()
  }, [tankData.tank_id])

  const handleSubmit = () => {
    onSave(tankData)
  }

  return (
    <div className="tank-form">
      <Labels>TANK NAME</Labels>
      <Select name="tank_name" value={tankData.tank_name} onChange={handleChange}>
        <option value="">Select Tank</option>
        {activeTanks.map((opt) => (
          <option key={opt.tank_id} value={opt.tank_name}>
            {opt.tank_name}
          </option>
        ))}
      </Select>

      <div className='form__tank-block'>
        {/* Fish Type Dropdown */}
        <Labels>FISH TYPE</Labels>
        <Select name="fish_type_name" value={tankData.fish_type_name} onChange={handleChange}>
          <option value="">Select</option>
          {fishType.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      </div>

      <div className="form__tank-block">
        <FormField
          label="FLOW"
          name="flow"
          type="checkbox"
          value={tankData.flow}
          onChange={handleChange}
        />
        <FormField
          label="CLEAN"
          name="clean"
          type="checkbox"
          value={tankData.clean}
          onChange={handleChange}
        />
      </div>
      <FormField label="DO" name="do_level" value={tankData.do_level} onChange={handleChange} />

      {/* Food Size Dropdown */}
      <Labels>FOOD SIZE (EVERY TUESDAY)</Labels>
      <Select
        name="food_size"
        value={tankData.food_size}
        onChange={handleChange}
        disabled={!isTuesday && !isAdmin}
      >
        <option value="">Select</option>
        {foodOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </Select>

      {/* Fish Size Input */}
      <FormField
        label="FISH SIZE (EVERY TUESDAY)"
        name="fish_size"
        value={tankData.fish_size}
        onChange={handleChange}
        disabled={!isTuesday && !isAdmin}
      />

      <FormField
        label="NUMBER OF FISHES"
        name="number_of_fishes"
        value={tankData.number_of_fishes}
        onChange={handleChange}
      />

      <FormField label="DIET" name="diet" value={tankData.diet} onChange={handleChange} />

      <Labels>DIET TYPE (GRAMS / L)</Labels>
      <Select name="diet_type" value={tankData.diet_type} onChange={handleChange}>
        <option value="">Select</option>
        {dietTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </Select>

      <FormField label="MORT" name="mort" value={tankData.mort} onChange={handleChange} />

      <Button onClick={handleSubmit}>Save</Button>
      <Button onClick={onCancel}>Cancel</Button>
    </div>
  )
}
