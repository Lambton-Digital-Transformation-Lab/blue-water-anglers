import { useEffect, useState } from 'react'
import { Button, Dropdown } from '../../atoms'
import PropTypes from 'prop-types'

export const OperationsMenu = ({ SendSearchValueToParent }) => {
  const initialFilter = {
    month: '',
    year: ''
  }

  const [oldestYear, setOldestYear] = useState(2020)
  const [filterDate, setFilterDate] = useState(initialFilter)

  useEffect(() => {
    fetchYeardata()
  },[])

  const fetchYeardata = async () => {
     const result = await window.electron.api.getFirstRecordYear()
     const year =  new Date(result).getFullYear()
     setOldestYear(year)
  }


  const handleChange = (e) => {
    const { name, value } = e.target
    setFilterDate((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleClear = () => {
    setFilterDate(initialFilter)
    SendSearchValueToParent(initialFilter)
  }

  const monthOptions = [
    { value: '', label: 'Select Month' },
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ]

  const currentYear = new Date().getFullYear()
  const yearOptions = [{ value: '', label: 'Select Year' }]

  for (let year = oldestYear; year <= currentYear; year++) {
    yearOptions.push({ value: year, label: year })
  }
  return (
    <div className="operation-menu--container">
      <h2 className="form_title">Filter by Date</h2>

      <label className="form_lables">Month</label>
      <Dropdown name="month" value={filterDate.month} onChange={handleChange}>
        {monthOptions.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Dropdown>

      <label className="form_lables">Year</label>
      <Dropdown name="year" value={filterDate.year} onChange={handleChange}>
        {yearOptions.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Dropdown>

      <Button variant="primary" onClick={() => SendSearchValueToParent(filterDate)}>
        Search
      </Button>
      <Button variant="secondary" onClick={handleClear} style={{ marginLeft: '1rem' }}>
        Clear
      </Button>
    </div>
  )
}

OperationsMenu.propTypes = {
  SendSearchValueToParent: PropTypes.func
}
