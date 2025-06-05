import { useEffect, useState } from 'react'
import { Button, Input } from '../atoms'
import { useNavigate } from 'react-router-dom'

export const ActivateTanks = () => {
  const navigate = useNavigate()
  const [tankInfo, setTankInfo] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)

  // Fetch tanks and user role
  useEffect(() => {
    const loadData = async () => {
      const data = await window.electron.api.getAllTankInfo()
      if (data) {
        setTankInfo(data)
        fetchUserRole()
      }
    }
    loadData()
  }, [])

  const fetchUserRole = async () => {
    const role = await window.electron.auth.getRole()
    if (role === 'admin') setIsAdmin(true)
  }

  // Handle edit click for tank
  const handleEdit = (id) => {
    navigate(`/editTanks/${id}`)
  }

  // Handle toggle active checkbox
  const handleToggle = (event, tankId) => {
    // Update the tank's active status directly in the tankInfo state
    const updatedTankInfo = tankInfo.map((tank) =>
      tank.tank_id === tankId ? { ...tank, tank_active: event.target.checked } : tank
    )

    setTankInfo(updatedTankInfo)
  }
  const handleActivation = async () => {
    const updatedFormData = tankInfo.map((tank) => ({
      tank_name: tank.tank_name,
      tank_id: tank.tank_id,
      tank_active: tank.tank_active ? 1 : 0
    }))

    // Send the updated data to the backend
    const result = await window.electron.api.activateTanks(updatedFormData)

    if (result.success) {
      setTankInfo([...updatedFormData])

      navigate('/addRecords')
    } else {
      alert(result.error || 'An error occurred while updating tanks')
    }
  }

  // Render form data for tanks
  const renderFormData = () => {
    if (tankInfo.length === 0) {
      return (
        <tr>
          <td colSpan="3">No Tanks Found</td>
        </tr>
      )
    }

    return tankInfo.map((tankData) => (
      <tr key={tankData.tank_id}>
        <td>{tankData.tank_name}</td>
        <td>
          <Input
            type="checkbox"
            checked={tankData.tank_active}
            onChange={(event) => handleToggle(event, tankData.tank_id)}
          />
        </td>
        {isAdmin && (
          <td>
            <Button variant={'primary'} onClick={() => handleEdit(tankData.tank_id)}>
              Edit
            </Button>
          </td>
        )}
      </tr>
    ))
  }

  return (
    <div className="activate-tanks-layout">
      <h1>Activate Tanks</h1>
      <div className="render-tanks">
        <table>
          <thead>
            <tr>
              <th>Tank Name</th>
              <th>Active</th>
              {isAdmin && <th>Action</th>}
            </tr>
          </thead>
          <tbody>{renderFormData()}</tbody>
        </table>
      </div>
      {isAdmin && <Button onClick={() => navigate('/editTanks')}>Insert New Tank</Button>}
      <Button onClick={handleActivation}>Save & Exit</Button>
    </div>
  )
}
