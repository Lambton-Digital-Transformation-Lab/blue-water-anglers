import { useState } from 'react'
import { Header } from '../organisms/Header/Header'
import { Loader } from '../organisms/Loader/Loader'
import { Button } from '../atoms'
import { FormField } from '../molecules'

export const GenerateReports = () => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.')
      return
    }

    const startISO = new Date(startDate).toISOString()
    const endISO = new Date(endDate).toISOString()

    if (new Date(startISO) > new Date(endISO)) {
      alert('Start date must be before end date.')
      return
    }

    try {
      setLoading(true)
      const dates = {
        start: startISO,
        end: endISO
      }
      await window.electron.api.generateExcel(dates)
      alert('Excel file generated successfully.')
    } catch (err) {
      console.error(err)
      alert('Failed to generate Excel: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading && <Loader />}
      <Header displayMenus={false} displayReportMenu={true} />
      <div style={{ padding: '2rem' }}>
        <h2>Export Data to Excel</h2>
        <div style={{ marginBottom: '1rem' }}>
          <FormField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <FormField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <Button onClick={handleExport} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Excel'}
        </Button>
      </div>
    </>
  )
}
