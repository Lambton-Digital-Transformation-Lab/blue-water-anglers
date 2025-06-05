import { useEffect, useState } from 'react'
import { Header } from '../organisms/Header/Header'
import { Button, Input } from '../atoms'
import { useNavigate } from 'react-router-dom'
import { Loader } from '../organisms/Loader/Loader'

import { Tabs, TabList, Tab, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import TankSnapshotViewer from './TankSnapshots'
import { OperationsMenu } from '../organisms/OperationsMenu/OperationsMenu'

export const Dashboard = () => {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loader, setLoader] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [plantReadings, setPlantReadings] = useState([])
  const [snapshots, setSnapshots] = useState([])
  const [editRecordId, setEditRecordId] = useState(null)

  const [month, setMonth] = useState(null)
  const [year, setYear] = useState(null)
  
  useEffect(() => {
    getTodaysData()
    fetchUserRole()
    getData()
    getTotalPages()
  }, [page, totalPages, month, year])

  const getTodaysData = async () => {
    const getTodaysData = (await window.electron.api.getTodaysReadings()) || null
    if (getTodaysData) {
      setEditRecordId(getTodaysData[0]?.id)
    }
  }

  const getTotalPages = async () => {
    const totalPages = await window.electron.api.getTotalNumberOfPages('plant_readings')
    setTotalPages(Math.ceil(totalPages / 5))
  }

  const getData = async () => {
    const data = await window.electron.api.getPlantReadings(page, month, year)
    let tankSanpshots = []
    if (data['plant_readings']) {
      setPlantReadings(data['plant_readings'])
      data['plant_readings'].map((readings) => {
        if (readings['tank_snapshots']) {
          readings['tank_snapshots'].map((snapshot) => {
            snapshot.timestamp = readings.timestamp
            tankSanpshots.push(snapshot)
          })
        }
      })

      setSnapshots(tankSanpshots)
    }
  }

  const fetchUserRole = async () => {
    setLoader(true)
    const role = await window.electron.auth.getRole()
    if (role === 'admin') setIsAdmin(true)
    setLoader(false)
  }

  const handleLogout = () => {
    window.electron.auth.logout()
    window.location.reload()
  }

  const handlePageChange = (e) => {
    const val = parseInt(e.target.value)
    if (!isNaN(val) && val > 0 && val <= totalPages) {
      setPage(val)
    }
  }

  const SearchResults = (data) => {
    setMonth(data.month)
    setYear(data.year)
  }

  const handleNext = () => setPage((p) => p + 1)
  const handlePrev = () => setPage((p) => Math.max(1, p - 1))

  const handleEdit = (id) => {
    navigate(`/addRecords/${id}`)
  }

  const handleDelete = async (id) => {
    console.log(id)
    const result = await window.electron.api.deleteRecords(id)
    if (result && result.success) {
      window.location.reload()
    }
  }

  return (
    <>
      {loader && <Loader />}
      <Header isAdmin={isAdmin} recordId={editRecordId} />

      {/* 
         RENDER THE DATA
      */}
      <div className="center_page">
        <OperationsMenu SendSearchValueToParent={SearchResults} />
        <div className="tab-container">
          <Tabs className={'tab-custom'}>
            <TabList>
              <Tab>Base Area</Tab>
              <Tab>Aeration System</Tab>
              <Tab>Generator Area</Tab>
              <Tab>Tanks</Tab>
            </TabList>

            {/* BA Tab */}
            <TabPanel>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Header Pressure</th>
                    <th>Pump 1</th>
                    <th>Pump 2</th>
                    <th>Pump 3</th>
                    <th>Pump 4</th>
                    <th>East Pump</th>
                    <th>East Well Pressure</th>
                    <th>Water Temperature</th>
                    <th>Alarm</th>
                    {isAdmin && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {plantReadings.length == 0 ? (
                    <tr>
                      <td>No Data Available</td>
                    </tr>
                  ) : (
                    plantReadings.map((reading) => (
                      <tr key={reading.id}>
                        <td>{new Date(reading.timestamp).toLocaleDateString('en-GB')}</td>
                        <td>{reading.header_pressure_in}</td>
                        <td
                          className={
                            reading.pump_1_active ? 'active-table-cell' : 'inactive-table-cell'
                          }
                        >
                          {reading.pump_1_active ? 'ON' : 'OFF'}
                        </td>
                        <td
                          className={
                            reading.pump_2_active ? 'active-table-cell' : 'inactive-table-cell'
                          }
                        >
                          {reading.pump_2_active ? 'ON' : 'OFF'}
                        </td>
                        <td
                          className={
                            reading.pump_3_active ? 'active-table-cell' : 'inactive-table-cell'
                          }
                        >
                          {reading.pump_3_active ? 'ON' : 'OFF'}
                        </td>
                        <td
                          className={
                            reading.pump_4_active ? 'active-table-cell' : 'inactive-table-cell'
                          }
                        >
                          {reading.pump_4_active ? 'ON' : 'OFF'}
                        </td>
                        <td
                          className={
                            reading.east_pump_active ? 'active-table-cell' : 'inactive-table-cell'
                          }
                        >
                          {reading.east_pump_active ? 'ON' : 'OFF'}
                        </td>
                        <td>{reading.east_well_pressure}</td>
                        <td>{Number(reading.water_temperature).toFixed(1)}</td>
                        <td
                          className={
                            reading.alarm_activated ? 'active-table-cell' : 'inactive-table-cell'
                          }
                        >
                          {reading.alarm_activated ? 'Yes' : 'No'}
                        </td>
                        {isAdmin && (
                          <td>
                            <Button variant={'primary'} onClick={() => handleEdit(reading.id)}>
                              {' '}
                              Edit{' '}
                            </Button>
                            <Button variant={'primary'} onClick={() => handleDelete(reading.id)}>
                              {' '}
                              Delete{' '}
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </TabPanel>

            {/* AS Tab */}
            <TabPanel>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>East Blower North</th>
                    <th>East Blower South</th>
                    <th>West Blower</th>
                    <th>East Blower Pressure</th>
                    <th>West Blower Pressure</th>
                    <th>Overflow</th>
                    {isAdmin && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {plantReadings.length === 0 ? (
                    <tr>
                      <h1>No Data Available</h1>
                    </tr>
                  ) : (
                    plantReadings.map((reading) => (
                      <tr key={reading.id}>
                        <td>{new Date(reading.timestamp).toLocaleDateString('en-GB')}</td>
                        <td
                          className={
                            reading.east_blower_north_active
                              ? 'active-table-cell'
                              : 'inactive-table-cell'
                          }
                        >
                          {reading.east_blower_north_active ? 'ON' : 'OFF'}
                        </td>
                        <td
                          className={
                            reading.east_blower_south_active
                              ? 'active-table-cell'
                              : 'inactive-table-cell'
                          }
                        >
                          {reading.east_blower_south_active ? 'ON' : 'OFF'}
                        </td>
                        <td
                          className={
                            reading.west_blower_active ? 'active-table-cell' : 'inactive-table-cell'
                          }
                        >
                          {reading.west_blower_active ? 'ON' : 'OFF'}
                        </td>
                        <td>{reading.east_blower_header_pressure}</td>
                        <td>{reading.west_blower_header_pressure}</td>
                        <td
                          className={
                            reading.aeration_tank_overflow
                              ? 'active-table-cell'
                              : 'inactive-table-cell'
                          }
                        >
                          {reading.aeration_tank_overflow ? 'Yes' : 'No'}
                        </td>
                        {isAdmin && (
                          <td>
                            <Button variant={'primary'} onClick={() => handleEdit(reading.id)}>
                              {' '}
                              Edit{' '}
                            </Button>
                            <Button variant={'primary'} onClick={() => handleDelete(reading.id)}>
                              {' '}
                              Delete{' '}
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </TabPanel>

            {/* GA Tab */}
            <TabPanel>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Room Temp</th>
                    <th>Battery</th>
                    <th>Block Heater</th>
                    <th>Autostart</th>
                    <th>Hours</th>
                    <th>Fuel Tank Level</th>
                    <th>Transfer Switch</th>
                    <th>Generator at Rest</th>
                    <th>PLC Active</th>
                    {isAdmin && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {plantReadings.length === 0 ? (
                    <tr>
                      <h1>No Data Available</h1>
                    </tr>
                  ) : (
                    plantReadings.map((reading) => (
                      <tr key={reading.id}>
                        <td>{new Date(reading.timestamp).toLocaleDateString('en-GB')}</td>
                        <td>{reading.diesel_room_temperature}</td>
                        <td>{reading.battery_voltage}</td>
                        <td
                          className={
                            reading.block_heater_active
                              ? 'active-table-cell'
                              : 'inactive-table-cell'
                          }
                        >
                          {reading.block_heater_active ? 'ON' : 'OFF'}
                        </td>
                        <td
                          className={
                            reading.generator_autostart
                              ? 'active-table-cell'
                              : 'inactive-table-cell'
                          }
                        >
                          {reading.generator_autostart ? 'Yes' : 'No'}
                        </td>
                        <td>{`${reading.generator_hours} h / ${reading.generator_minutes} m`}</td>
                        <td>{reading.fuel_tank_level}</td>
                        <td
                          className={
                            reading.transfer_switch_active
                              ? 'active-table-cell'
                              : 'inactive-table-cell'
                          }
                        >
                          {reading.transfer_switch_active ? 'ON' : 'OFF'}
                        </td>
                        <td
                          className={
                            reading.generator_at_rest ? 'active-table-cell' : 'inactive-table-cell'
                          }
                        >
                          {reading.generator_at_rest ? 'Yes' : 'No'}
                        </td>
                        <td
                          className={
                            reading.plc_active ? 'active-table-cell' : 'inactive-table-cell'
                          }
                        >
                          {reading.plc_active ? 'ON' : 'OFF'}
                        </td>
                        {isAdmin && (
                          <td>
                            <Button variant={'primary'} onClick={() => handleEdit(reading.id)}>
                              {' '}
                              Edit{' '}
                            </Button>
                            <Button variant={'primary'} onClick={() => handleDelete(reading.id)}>
                              {' '}
                              Delete{' '}
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </TabPanel>

            <TabPanel>
              <TankSnapshotViewer snapshots={snapshots} isAdmin={isAdmin} />
            </TabPanel>
          </Tabs>
        </div>

        <div className="footer">
          {isAdmin ? (
            <Button variant={'logout'} onClick={handleLogout}>
              Switch to User
            </Button>
          ) : (
            <Button onClick={() => navigate('/login')}>Login as Admin</Button>
          )}
          <Button onClick={() => navigate('/documentation')} variant={'primary'}>Help</Button>

          <div className="pagination">
            <Button onClick={handlePrev} disabled={page === 1}>
              &#8592; Previous
            </Button>
            <Input
              type="number"
              value={page}
              onChange={handlePageChange}
              style={{ width: 60, margin: '0 10px' }}
            />
            <span>/ {totalPages} </span>
            <Button disabled={page === totalPages} onClick={handleNext}>
              Next &#8594;
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
