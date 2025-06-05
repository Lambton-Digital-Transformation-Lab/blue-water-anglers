import * as d3 from 'd3'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Header } from '../organisms/Header/Header'
import { FormField } from '../molecules/FormField/FormField'

import { Loader } from '../organisms/Loader/Loader'
import { Button, Dropdown } from '../atoms'

export const GenerateAverageFoodWeight = () => {
  const navigate = useNavigate()
  const svgRef = useRef()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [foodData, setFoodData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterHeading, setFilterHeading] = useState(null)

  const [selectedFoodType, setSelectedFoodType] = useState('')
  const [selectedTank, setSelectedTank] = useState('')

  const fetchData = async () => {
    if (!startDate || !endDate) return
    setLoading(true)
    try {
      const dates = { start: startDate, end: endDate }
      const result = await window.electron.api.getDataUsingDate(dates)

      console.log(result)
      // Process the tank snapshots data
      const processedData = result.flatMap((reading) => {
        const timestamp = new Date(reading.timestamp)
        return reading.tank_snapshots.map((snapshot) => {
          // Check if diet is in Liters and convert to Grams
          let foodWeight = snapshot.diet * snapshot.number_of_fishes
          if (snapshot.diet_unit === 'L') {
            // Convert liters to grams (assuming 1L = 1000g)
            foodWeight = foodWeight * 1000
          }

          return {
            food_type: snapshot.food_size,
            // Total food weight for snapshot in grams
            food_weight: foodWeight,
            // Month formatted as 'YYYY-MM'
            month: d3.timeFormat('%Y-%m')(timestamp),
            tank_name: snapshot.tank_name
          }
        })
      })

      setFoodData(processedData)
      setFilterHeading({
        startDate,
        endDate
      })
    } catch (err) {
      console.error('Error fetching data:', err)
    }
    setLoading(false)
  }

  // Apply filters based on selected food type and tank
  const applyFilters = () => {
    let filtered = foodData

    if (selectedFoodType) {
      filtered = filtered.filter((d) => d.food_type === selectedFoodType)
    }

    if (selectedTank) {
      filtered = filtered.filter((d) => d.tank_name === selectedTank)
    }

    setFilteredData(filtered)
  }

  useEffect(() => {
    if (foodData.length > 0) {
      applyFilters()
    }
  }, [foodData, selectedFoodType, selectedTank])

  useEffect(() => {
    drawChart()
  }, [filteredData, startDate, endDate])

  // Function to draw the bar chart
  const drawChart = () => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const numMonths = filteredData.length
    const widthPerMonth = 50
    const totalWidth = Math.min(numMonths * widthPerMonth, 600)
    const containerHeight = 500

    const margin = { top: 40, right: 40, bottom: 80, left: 70 }
    const width = totalWidth - margin.left - margin.right
    const height = containerHeight - margin.top - margin.bottom

    svg.attr('width', totalWidth).attr('height', containerHeight)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // Group the food data by month, tank_name, and food_type
    const groupedData = d3.rollups(
      filteredData,
      // Summing food weights
      (v) => d3.sum(v, (d) => d.food_weight),
      // Group by month
      (d) => d.month,
      // Group by tank name
      (d) => d.tank_name,
      // Group by food size
      (d) => d.food_type
    )

    // Ensure the groupedData is valid and has the expected structure
    if (!groupedData || !Array.isArray(groupedData)) {
      console.error('Invalid grouped data structure:', groupedData)
      return
    }

    // Flatten the grouped data structure
    const flattenedData = groupedData.map(([month, tanks]) => ({
      month,
      tanks: tanks.map(([tank, foodTypes]) => ({
        tank,
        food_types: foodTypes.map(([food_type, totalWeight]) => ({ food_type, totalWeight }))
      }))
    }))

    const x = d3
      .scaleBand()
      .domain(flattenedData.map((d) => d.month))
      .range([0, width])
      .padding(0.3)

    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(flattenedData, (d) =>
          d3.max(d.tanks, (t) => d3.max(t.food_types, (f) => f.totalWeight))
        )
      ])
      .nice()
      .range([height, 0])

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('font-size', '12px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')

    g.append('g').call(d3.axisLeft(y)).selectAll('text').style('font-size', '12px')

    // Draw bars for each food size in each tank
    const barWidth = x.bandwidth() / flattenedData[0]?.tanks.length
    flattenedData.forEach((data, i) => {
      data.tanks.forEach((tankData, j) => {
        tankData.food_types.forEach((foodData, k) => {
          g.append('rect')
            .attr('x', x(data.month) + j * barWidth)
            .attr('y', y(foodData.totalWeight))
            .attr('width', barWidth)
            .attr('height', height - y(foodData.totalWeight))
            .attr('fill', d3.schemeCategory10[k])
            .attr('data-month', data.month)
            .attr('data-tank', tankData.tank)
            .attr('data-food-size', foodData.food_type)
            .attr('data-weight', foodData.totalWeight)
            .on('mouseover', (event, d) => {
              tooltip.transition().duration(200).style('opacity', 1)
              tooltip
                .html(
                  `Month: ${data.month}<br/>Tank: ${tankData.tank}<br/>Food Size: ${foodData.food_type}<br/>Food Weight: ${Number(foodData.totalWeight).toFixed(2)} gm`
                )
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 20}px`)
            })
            .on('mouseout', () => {
              tooltip.transition().duration(300).style('opacity', 0)
            })
        })
      })
    })

    // Tooltip setup
    const tooltip = d3
      .select('.scroll-container')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('opacity', 0)
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '5px')
  }

  const saveAsPNG = () => {
    fetchData()
    const svg = svgRef.current
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const svgRect = svg.getBoundingClientRect()
    canvas.width = svgRect.width
    canvas.height = svgRect.height

    const ctx = canvas.getContext('2d')
    const img = new Image()
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)

      const pngUrl = canvas.toDataURL('image/png')

      const base64Data = pngUrl.split(',')[1]
      window.electron.api.saveGraphs('png', base64Data)
    }

    img.src = url
  }

  return (
    <>
      {loading && <Loader />}
      <Header displayMenus={false} displayReportMenu={false}>
        <div className="header-menu">
          <Button variant={'regular'} onClick={() => navigate('/generateGraphs')}>
            BACK TO GENERATE GRAPHS
          </Button>
        </div>
      </Header>
      <div className="generate-food-weight-container">
        <div className="controls">
          <FormField
            label="START DATE"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <FormField
            label="END DATE"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          {foodData.length !== 0 && (
            <div>
              <label className="form_lables" htmlFor="food-size-select">
                SELECT FOOD SIZE
              </label>

              <Dropdown
                onChange={(e) => setSelectedFoodType(e.target.value)}
                name="food_size"
                id="food-size-select"
                value={selectedFoodType}
              >
                <option value="">All</option>
                {Array.from(new Set(foodData.map((d) => d.food_type))).map((foodType) => (
                  <option key={foodType} value={foodType}>
                    {foodType}
                  </option>
                ))}
              </Dropdown>

              {/* Tank Dropdown */}
              <label className="form_lables" htmlFor="tank-select">
                SELECT TANK
              </label>
              <Dropdown
                id="tank-select"
                value={selectedTank}
                onChange={(e) => setSelectedTank(e.target.value)}
              >
                <option value="">All</option>
                {Array.from(new Set(foodData.map((d) => d.tank_name))).map((tank) => (
                  <option key={tank} value={tank}>
                    {tank}
                  </option>
                ))}
              </Dropdown>
            </div>
          )}

          <Button onClick={fetchData} variant={'regular'}>
            Draw Graph
          </Button>
          <Button onClick={saveAsPNG}>Download PNG</Button>
        </div>
        <div>
          {filterHeading && (
            <h2 className="text-center">
              Food Weight Consumption from {filterHeading.startDate} to {filterHeading.endDate}
            </h2>
          )}
          <div className="scroll-container">
            <svg ref={svgRef}></svg>
          </div>
        </div>
      </div>
    </>
  )
}
