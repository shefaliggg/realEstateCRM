import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'

function useContainerWidth() {
  const containerRef = useRef(null)
  const [width, setWidth] = useState(640)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return undefined

    const update = () => setWidth(Math.max(320, node.clientWidth || 640))
    update()

    const observer = new ResizeObserver(update)
    observer.observe(node)
    window.addEventListener('resize', update)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  return { containerRef, width }
}

function ChartShell({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      {subtitle ? <p className="text-xs text-gray-500 mt-1 mb-4">{subtitle}</p> : <div className="mb-4" />}
      {children}
    </div>
  )
}

export function D3BarChart({ title, subtitle, data, xKey, yKey, color = '#2563eb', height = 280, formatY }) {
  const svgRef = useRef(null)
  const { containerRef, width } = useContainerWidth()

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    if (!data?.length) return

    const margin = { top: 12, right: 12, bottom: 52, left: 46 }
    const w = width
    const h = height
    const innerW = w - margin.left - margin.right
    const innerH = h - margin.top - margin.bottom

    const x = d3
      .scaleBand()
      .domain(data.map((d) => String(d[xKey])))
      .range([0, innerW])
      .padding(0.22)

    const yMax = d3.max(data, (d) => Number(d[yKey] || 0)) || 0
    const y = d3.scaleLinear().domain([0, yMax * 1.1 || 1]).nice().range([innerH, 0])

    const g = svg
      .attr('width', w)
      .attr('height', h)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((v) => (formatY ? formatY(v) : v)))
      .call((axis) => axis.select('.domain').attr('stroke', '#d1d5db'))
      .call((axis) => axis.selectAll('line').attr('stroke', '#e5e7eb'))
      .call((axis) => axis.selectAll('text').attr('fill', '#6b7280').attr('font-size', 11))

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
      .call((axis) => axis.select('.domain').attr('stroke', '#d1d5db'))
      .call((axis) => axis.selectAll('line').remove())
      .call((axis) => axis.selectAll('text').attr('fill', '#6b7280').attr('font-size', 10).attr('transform', 'rotate(-20)').style('text-anchor', 'end'))

    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => x(String(d[xKey])) || 0)
      .attr('y', (d) => y(Number(d[yKey] || 0)))
      .attr('width', x.bandwidth())
      .attr('height', (d) => innerH - y(Number(d[yKey] || 0)))
      .attr('rx', 6)
      .attr('fill', color)
      .attr('opacity', 0.9)

    g.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', (d) => (x(String(d[xKey])) || 0) + x.bandwidth() / 2)
      .attr('y', (d) => y(Number(d[yKey] || 0)) - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', '#374151')
      .attr('font-size', 10)
      .text((d) => (formatY ? formatY(Number(d[yKey] || 0)) : Number(d[yKey] || 0)))
  }, [color, data, formatY, height, width, xKey, yKey])

  return (
    <ChartShell title={title} subtitle={subtitle}>
      <div ref={containerRef} className="w-full">
        {data?.length ? <svg ref={svgRef} /> : <p className="text-sm text-gray-400">No data available.</p>}
      </div>
    </ChartShell>
  )
}

export function D3LineChart({ title, subtitle, data, xKey, yKey, color = '#16a34a', height = 280, formatY }) {
  const svgRef = useRef(null)
  const { containerRef, width } = useContainerWidth()

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    if (!data?.length) return

    const margin = { top: 14, right: 14, bottom: 44, left: 46 }
    const w = width
    const h = height
    const innerW = w - margin.left - margin.right
    const innerH = h - margin.top - margin.bottom

    const x = d3
      .scalePoint()
      .domain(data.map((d) => String(d[xKey])))
      .range([0, innerW])

    const yMax = d3.max(data, (d) => Number(d[yKey] || 0)) || 0
    const y = d3.scaleLinear().domain([0, yMax * 1.15 || 1]).nice().range([innerH, 0])

    const g = svg
      .attr('width', w)
      .attr('height', h)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((v) => (formatY ? formatY(v) : v)))
      .call((axis) => axis.select('.domain').attr('stroke', '#d1d5db'))
      .call((axis) => axis.selectAll('line').attr('stroke', '#e5e7eb'))
      .call((axis) => axis.selectAll('text').attr('fill', '#6b7280').attr('font-size', 11))

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
      .call((axis) => axis.select('.domain').attr('stroke', '#d1d5db'))
      .call((axis) => axis.selectAll('line').remove())
      .call((axis) => axis.selectAll('text').attr('fill', '#6b7280').attr('font-size', 10))

    const line = d3
      .line()
      .x((d) => x(String(d[xKey])) || 0)
      .y((d) => y(Number(d[yKey] || 0)))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 3)
      .attr('d', line)

    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => x(String(d[xKey])) || 0)
      .attr('cy', (d) => y(Number(d[yKey] || 0)))
      .attr('r', 4)
      .attr('fill', color)

    g.selectAll('.dot-label')
      .data(data)
      .enter()
      .append('text')
      .attr('x', (d) => x(String(d[xKey])) || 0)
      .attr('y', (d) => y(Number(d[yKey] || 0)) - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', '#374151')
      .attr('font-size', 10)
      .text((d) => (formatY ? formatY(Number(d[yKey] || 0)) : Number(d[yKey] || 0)))
  }, [color, data, formatY, height, width, xKey, yKey])

  return (
    <ChartShell title={title} subtitle={subtitle}>
      <div ref={containerRef} className="w-full">
        {data?.length ? <svg ref={svgRef} /> : <p className="text-sm text-gray-400">No data available.</p>}
      </div>
    </ChartShell>
  )
}

export function D3DonutChart({ title, subtitle, data, labelKey, valueKey, colors }) {
  const svgRef = useRef(null)
  const { containerRef, width } = useContainerWidth()

  const palette = useMemo(
    () => colors || ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'],
    [colors],
  )

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    if (!data?.length) return

    const w = width
    const h = 300
    const radius = Math.min(w, h) / 2 - 20

    const values = data.map((d) => Number(d[valueKey] || 0))
    const total = values.reduce((a, b) => a + b, 0)
    if (!total) return

    const g = svg
      .attr('width', w)
      .attr('height', h)
      .append('g')
      .attr('transform', `translate(${w / 2},${h / 2})`)

    const pie = d3.pie().value((d) => Number(d[valueKey] || 0)).sort(null)
    const arc = d3.arc().innerRadius(radius * 0.58).outerRadius(radius)

    g.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (_, i) => palette[i % palette.length])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.1em')
      .attr('font-size', 18)
      .attr('font-weight', 700)
      .attr('fill', '#111827')
      .text(total)

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .attr('font-size', 11)
      .attr('fill', '#6b7280')
      .text('Total')
  }, [data, labelKey, palette, valueKey, width])

  return (
    <ChartShell title={title} subtitle={subtitle}>
      <div ref={containerRef} className="w-full space-y-3">
        {data?.length ? <svg ref={svgRef} /> : <p className="text-sm text-gray-400">No data available.</p>}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {(data || []).map((d, idx) => (
            <div key={String(d[labelKey])} className="flex items-center gap-2 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: palette[idx % palette.length] }} />
              <span className="truncate">{d[labelKey]}: {d[valueKey]}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartShell>
  )
}

export function D3StackedBarChart({ title, subtitle, data, xKey, keys, colors }) {
  const svgRef = useRef(null)
  const { containerRef, width } = useContainerWidth()
  const palette = useMemo(() => colors || ['#2563eb', '#16a34a', '#f59e0b', '#ef4444'], [colors])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    if (!data?.length) return

    const margin = { top: 16, right: 14, bottom: 56, left: 46 }
    const w = width
    const h = 300
    const innerW = w - margin.left - margin.right
    const innerH = h - margin.top - margin.bottom

    const x = d3
      .scaleBand()
      .domain(data.map((d) => String(d[xKey])))
      .range([0, innerW])
      .padding(0.22)

    const stack = d3.stack().keys(keys)
    const series = stack(data)

    const yMax = d3.max(data, (d) => keys.reduce((sum, key) => sum + Number(d[key] || 0), 0)) || 0
    const y = d3.scaleLinear().domain([0, yMax * 1.1 || 1]).nice().range([innerH, 0])

    const g = svg
      .attr('width', w)
      .attr('height', h)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .call((axis) => axis.select('.domain').attr('stroke', '#d1d5db'))
      .call((axis) => axis.selectAll('line').attr('stroke', '#e5e7eb'))
      .call((axis) => axis.selectAll('text').attr('fill', '#6b7280').attr('font-size', 11))

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
      .call((axis) => axis.select('.domain').attr('stroke', '#d1d5db'))
      .call((axis) => axis.selectAll('line').remove())
      .call((axis) => axis.selectAll('text').attr('fill', '#6b7280').attr('font-size', 10).attr('transform', 'rotate(-20)').style('text-anchor', 'end'))

    series.forEach((layer, i) => {
      g.selectAll(`.stack-${i}`)
        .data(layer)
        .enter()
        .append('rect')
        .attr('x', (d) => x(String(d.data[xKey])) || 0)
        .attr('y', (d) => y(d[1]))
        .attr('height', (d) => y(d[0]) - y(d[1]))
        .attr('width', x.bandwidth())
        .attr('fill', palette[i % palette.length])
        .attr('rx', 4)
    })
  }, [data, keys, palette, width, xKey])

  return (
    <ChartShell title={title} subtitle={subtitle}>
      <div ref={containerRef} className="w-full space-y-3">
        {data?.length ? <svg ref={svgRef} /> : <p className="text-sm text-gray-400">No data available.</p>}
        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
          {keys.map((key, idx) => (
            <span key={key} className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: palette[idx % palette.length] }} />
              {key}
            </span>
          ))}
        </div>
      </div>
    </ChartShell>
  )
}
