import { useState, useMemo } from 'react'
import { Button } from '../atoms'
import { useNavigate } from 'react-router-dom'
import { Select } from '../atoms/Inputs'

export const TankSnapshotViewer = (data = []) => {
  const navigate = useNavigate()
  const snapshotArray = data.snapshots
  const isAdmin = data.isAdmin

  const tankNames = useMemo(() => {
    const unique = new Map()
    snapshotArray.forEach((snap) => {
      const name = snap.tank_name.toLowerCase()
      if (!unique.has(name)) {
        unique.set(name, snap.tank_name)
      }
    })
    return Array.from(unique.values())
  }, [])

  const [currentIndex, setCurrentIndex] = useState(0)

  const handleDropdownChange = (e) => {
    const selectedName = e.target.value
    const index = tankNames.findIndex((name) => name === selectedName)
    if (index !== -1) setCurrentIndex(index)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? tankNames.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === tankNames.length - 1 ? 0 : prev + 1))
  }

  const currentTankName = tankNames[currentIndex]
  const filteredSnapshots = snapshotArray.filter(
    (snap) => snap.tank_name.toLowerCase() === currentTankName.toLowerCase()
  )

  const handleEdit = (id) => {
    navigate(`/addRecords/${id}`)
  }

  return (
    <div>
      <div className="tank_settings_table">
        <h3>TANK NAME</h3>
        <Select value={currentTankName} onChange={handleDropdownChange}>
          {tankNames.map((name, idx) => (
            <option key={idx} value={name}>
              {name}
            </option>
          ))}
        </Select>
        <Button onClick={handlePrev}>&#8592;</Button>
        <Button onClick={handleNext}>&#8594;</Button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Fish Type</th>
            <th>Flow</th>
            <th>Clean</th>
            <th>DO Level</th>
            <th>Number Of Fishes</th>
            <th>Food Size</th>
            <th>Fish Size</th>
            <th>Diet</th>
            <th>Diet Type</th>
            <th>Mortality</th>
            {isAdmin && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {filteredSnapshots.map((snap) => (
            <tr key={snap.snapshot_id}>
              <td>{snap.timestamp}</td>
              <td>{snap.fish_type_name}</td>
              <td className={snap.flow ? 'active-table-cell' : 'inactive-table-cell'}>
                {snap.flow ? 'True' : 'False'}
              </td>
              <td className={snap.clean ? 'active-table-cell' : 'inactive-table-cell'}>
                {snap.clean ? 'True' : 'False'}
              </td>
              <td>{snap.do_level}</td>
              <td>{snap.number_of_fishes}</td>
              <td>{snap.food_size}</td>
              <td>{snap.fish_size}</td>
              <td>{snap.diet}</td>
              <td>{snap.diet_type}</td>
              <td>{snap.mort}</td>
              {isAdmin && (
                <td>
                  <Button variant={'primary'} onClick={() => handleEdit(snap.reading_id)}>
                    {' '}
                    Edit{' '}
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TankSnapshotViewer
