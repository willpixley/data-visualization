import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function PerformanceLineChart({
	dates = [],
	prices = [],
	tradeDate = null,
}) {
	const chartRef = useRef(null);
	const resizeObserverRef = useRef(null);

	const drawChart = () => {
		const chartEl = chartRef.current;
		if (!chartEl || !dates.length || !prices.length) return;

		// Clear old chart
		d3.select(chartEl).selectAll('*').remove();

		const data = dates.map((d, i) => ({
			x: new Date(d),
			y: prices[i],
		}));

		const margin = { top: 20, right: 30, bottom: 40, left: 60 };
		const width = chartEl.offsetWidth - margin.left - margin.right;
		const height = chartEl.offsetHeight - margin.top - margin.bottom;

		const svg = d3
			.select(chartEl)
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// Scales
		const x = d3
			.scaleTime()
			.domain(d3.extent(data, (d) => d.x))
			.range([0, width]);

		const y = d3
			.scaleLinear()
			.domain([
				d3.min(data, (d) => d.y) * 0.95,
				d3.max(data, (d) => d.y) * 1.05,
			])
			.nice()
			.range([height, 0]);

		// Axes
		const xAxis = svg
			.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x).tickFormat(d3.timeFormat('%b %d')));

		xAxis.selectAll('text').style('fill', '#e0e0e0');
		xAxis.selectAll('.domain, .tick line').style('stroke', '#e0e0e0');

		const yAxis = svg.append('g').call(d3.axisLeft(y));

		yAxis.selectAll('text').style('fill', '#e0e0e0');
		yAxis.selectAll('.domain, .tick line').style('stroke', '#e0e0e0');

		// Line
		svg.append('path')
			.datum(data)
			.attr('fill', 'none')
			.attr('stroke', 'steelblue')
			.attr('stroke-width', 1.5)
			.attr(
				'd',
				d3
					.line()
					.x((d) => x(d.x))
					.y((d) => y(d.y))
			);

		// Vertical trade date line
		if (tradeDate) {
			const t = new Date(tradeDate);
			if (!isNaN(t.getTime())) {
				svg.append('line')
					.attr('x1', x(t))
					.attr('x2', x(t))
					.attr('y1', 0)
					.attr('y2', height)
					.attr('stroke', 'red')
					.attr('stroke-width', 2)
					.attr('stroke-dasharray', '4 2');
			}
		}

		// Hover tool
		const bisect = d3.bisector((d) => d.x).left;

		const focusCircle = svg
			.append('circle')
			.style('fill', '#e0e0e0')
			.attr('stroke', 'black')
			.attr('r', 5)
			.style('opacity', 0);

		const focusText = svg
			.append('text')
			.style('opacity', 0)
			.style('fill', '#e0e0e0')
			.attr('text-anchor', 'end')
			.attr('alignment-baseline', 'middle');

		// Transparent overlay for mouse events
		svg.append('rect')
			.style('fill', 'none')
			.style('pointer-events', 'all')
			.attr('width', width)
			.attr('height', height)
			.on('mouseover', () => {
				focusCircle.style('opacity', 1);
				focusText.style('opacity', 1);
			})
			.on('mouseout', () => {
				focusCircle.style('opacity', 0);
				focusText.style('opacity', 0);
			})
			.on('mousemove', function (event) {
				const x0 = x.invert(d3.pointer(event, this)[0]);
				const i = bisect(data, x0, 1);
				const d0 = data[i - 1];
				const d1 = data[i] || d0;
				const d = x0 - d0.x > d1.x - x0 ? d1 : d0;

				focusCircle.attr('cx', x(d.x)).attr('cy', y(d.y));

				const pad = 10;
				focusText
					.text(
						`${d3.timeFormat('%b %d, %Y')(d.x)} — $${d.y.toFixed(
							2
						)}`
					)
					.attr('x', width - pad)
					.attr('y', pad);
			});
	};

	useEffect(() => {
		drawChart();

		resizeObserverRef.current = new ResizeObserver(() => drawChart());
		resizeObserverRef.current.observe(chartRef.current);

		return () => {
			if (resizeObserverRef.current)
				resizeObserverRef.current.disconnect();
		};
	}, [dates, prices, tradeDate]);

	return (
		<div
			ref={chartRef}
			className='h-72 w-full rounded-3xl bg-background shadow sm:h-80 md:h-96'></div>
	);
}
