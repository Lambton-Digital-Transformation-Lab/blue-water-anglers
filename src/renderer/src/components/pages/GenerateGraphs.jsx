import * as d3 from 'd3'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Header } from '../organisms/Header/Header'
import { FormField } from '../molecules/FormField/FormField'

import { Loader } from '../organisms/Loader/Loader'
import { Button } from '../atoms'

import { PDFDocument } from 'pdf-lib'

export const GenerateGraphs = () => {
  const navigate = useNavigate()
  const svgRef = useRef()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [fishType, setFishType] = useState('RAINBOW TROUT')
  const [data, setData] = useState([])
  const [weightPerWeek, setweightPerWeek] = useState([])
  const [loading, setLoading] = useState(false)

  const [filterHeading, setFilterHeading] = useState(null)

  const fetchData = async () => {
    if (!startDate || !endDate) return
    setLoading(true)
    try {
      const dates = { start: startDate, end: endDate, orderType: 'ASC' }
      const result = await window.electron.api.getDataUsingDate(dates)

      const filteredSnapshots = result.flatMap((reading) => {
        const ts = reading.timestamp
        return reading.tank_snapshots
          .filter((s) => s.fish_type_name.toLowerCase() === fishType.toLowerCase())
          .map((s) => ({ ...s, timestamp: ts }))
      })

      setData(filteredSnapshots)

      const weeklyData = d3
        .rollups(
          filteredSnapshots,
          (v) => d3.sum(v, (d) => d.fish_size || 0),
          (d) => d3.timeFormat('W%V-%Y')(new Date(d.timestamp))
        )
        .map(([week, totalWeight]) => ({ week, totalWeight }))

      setweightPerWeek(weeklyData)
      setFilterHeading({
        fishType,
        startDate,
        endDate
      })
    } catch (err) {
      console.error('Error fetching data:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    drawChart()
  }, [weightPerWeek, startDate, endDate, fishType])

  const drawChart = () => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const numWeeks = weightPerWeek.length
    const widthPerWeek = 60
    const totalWidth = Math.max(numWeeks * widthPerWeek, 800)
    const containerHeight = 500

    const margin = { top: 40, right: 40, bottom: 100, left: 70 }
    const width = totalWidth - margin.left - margin.right
    const height = containerHeight - margin.top - margin.bottom

    svg.attr('width', totalWidth).attr('height', containerHeight)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3
      .scalePoint()
      .domain(weightPerWeek.map((d) => d.week))
      .range([0, width])
      .padding(0.5)

    const maxY = Math.max(d3.max(weightPerWeek, (d) => d.totalWeight) || 0, 10)
    const y = d3
      .scaleLinear()
      .domain([0, maxY * 1.2])
      .nice()
      .range([height, 0])

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('font-size', '14px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')

    g.append('g').call(d3.axisLeft(y)).selectAll('text').style('font-size', '14px')

    g.append('path')
      .datum(weightPerWeek)
      .attr('fill', 'none')
      .attr('stroke', '#ff6600')
      .attr('stroke-width', 2)
      .attr(
        'd',
        d3
          .line()
          .x((d) => x(d.week))
          .y((d) => y(d.totalWeight))
      )

    g.selectAll('circle')
      .data(weightPerWeek)
      .enter()
      .append('circle')
      .attr('cx', (d) => x(d.week))
      .attr('cy', (d) => y(d.totalWeight))
      .attr('r', 4)
      .attr('fill', 'steelblue')

    const tooltip = d3
      .select('.scroll-container')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('opacity', 0)
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '5px')

    g.selectAll('circle')
      .on('mouseover', (event, d) => {
        tooltip.transition().duration(200).style('opacity', 1)
        tooltip
          .html(`Week: ${d.week}<br/>Weight: ${Number(d.totalWeight).toFixed(2)}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 20}px`)
      })
      .on('mouseout', () => {
        tooltip.transition().duration(300).style('opacity', 0)
      })
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
          <Button variant={'regular'} onClick={() => navigate('/averageFoodWeight')}>
            FOOD WEIGHT CONSUMPTION
          </Button>
          <Button variant={'regular'} onClick={() => navigate('/generateReports')}>
            BACK TO GENERATE REPORTS
          </Button>
        </div>
      </Header>
      <div className="generate-graphs-container">
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
          <FormField
            label="FISH TYPE"
            type="text"
            value={fishType}
            onChange={(e) => setFishType(e.target.value)}
          />
          <Button onClick={fetchData} variant={'regular'}>
            Draw Graphs
          </Button>
          <Button onClick={saveAsPNG}>Download PNG</Button>
        </div>

        <div>
          {filterHeading && (
            <h2 className="text-center">
              Growth of {filterHeading.fishType} from {filterHeading.startDate} to{' '}
              {filterHeading.endDate}
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
