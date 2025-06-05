import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FormField } from '../molecules'
import { Button } from '../atoms'

export const EditTanks = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState({
    tank_id: '',
    tank_name: '',
    tank_active: 0
  })

  useEffect(() => {
    if (id) {
      const fetchTankData = async () => {
        const data = await window.electron.api.getTankById(id)
        if (data) {
          setFormData(data.tank)
        }
      }

      fetchTankData()
    }
  }, [id])

  const submitTanks = async () => {
    const { tank_name, tank_active, tank_id } = formData

    if (id) {
      // Update existing tank
      await window.electron.api.updateTankInfo({ tank_name, tank_active, tank_id })
    } else {
      // Insert new tank
      await window.electron.api.insertTanks(tank_name, tank_active)
    }

    navigate('/addRecords')
  }

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }))
  }

  return (
    <div className="add-tanks-container">
      <h1>Activate Tanks</h1>
      <div className="add-tanks-form-container">
        <FormField
          label="Tank Name"
          name="tank_name"
          value={formData.tank_name}
          onChange={handleChange}
        />
        <FormField
          label="Activate Tank"
          name="tank_active"
          type="checkbox"
          value={formData.tank_active}
          onChange={handleChange}
        />
        <div>
          <Button onClick={submitTanks}>Save</Button>
          <Button onClick={() => navigate('/activateTanks')}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}
