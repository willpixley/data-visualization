import { useMemo, useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';

export default function BuySellLineChart({ data, selectedSector }) {
	const [tooltip, setTooltip] = useState(null);
	const [brushStats, setBrushStats] = useState(null);
	const svgRef = useRef();

	// filter out by sector
	const filteredData = useMemo(() => {
		if (!selectedSector) return data;
		return data.filter((d) => d.sector_name === selectedSector);
	}, [data, selectedSector]);

	const { dates, buyCounts, sellCounts } = useMemo(() => {
		const parsed = filteredData.map((d) => ({
			date: new Date(d.trade_date),
			action: d.action,
		}));

		const buys = d3.rollup(
			parsed.filter((d) => d.action === 'b'),
			(v) => v.length,
			(d) => d3.timeDay(d.date)
		);

		const sells = d3.rollup(
			parsed.filter((d) => d.action === 's'),
			(v) => v.length,
			(d) => d3.timeDay(d.date)
		);

		const allDates = Array.from(
			new Set([...buys.keys(), ...sells.keys()])
		).sort((a, b) => a - b);

		return {
			dates: allDates,
			buyCounts: allDates.map((d) => buys.get(d) ?? 0),
			sellCounts: allDates.map((d) => sells.get(d) ?? 0),
		};
	}, [filteredData]);

	const width = 800;
	const height = 400;
	const margin = { top: 20, right: 30, bottom: 40, left: 50 };

	const x = d3
		.scaleUtc()
		.domain(d3.extent(dates))
		.range([margin.left, width - margin.right]);

	const y = d3
		.scaleLinear()
		.domain([0, d3.max([...buyCounts, ...sellCounts]) || 1])
		.nice()
		.range([height - margin.bottom, margin.top]);

	useEffect(() => {
		const svg = d3.select(svgRef.current);
		svg.select('.brush').remove();
		const brush = d3
			.brushX()
			.extent([
				[margin.left, margin.top],
				[width - margin.right, height - margin.bottom],
			])
			.on('brush end', (event) => {
				if (!event.selection) {
					setBrushStats(null);
					return;
				}

				const [x0, x1] = event.selection;
				const start = x.invert(x0);
				const end = x.invert(x1);

				// total in range
				let buyTotal = 0,
					sellTotal = 0;

				dates.forEach((d, i) => {
					if (d >= start && d <= end) {
						buyTotal += buyCounts[i];
						sellTotal += sellCounts[i];
					}
				});

				setBrushStats({
					start,
					end,
					buyTotal,
					sellTotal,
					x0,
					x1,
				});
			});

		svg.append('g').attr('class', 'brush').call(brush);
	}, [dates, buyCounts, sellCounts]);

	return (
		<div className='relative'>
			<svg ref={svgRef} width={width} height={height}>
				<g
					transform={`translate(0,${height - margin.bottom})`}
					ref={(node) => {
						if (node) {
							const axis = d3
								.select(node)
								.call(d3.axisBottom(x).ticks(7));

							axis.selectAll('text').attr('fill', '#fff');
							axis.selectAll('line').attr('stroke', '#fff');
							axis.selectAll('path').attr('stroke', '#fff');
						}
					}}
				/>

				<g
					transform={`translate(${margin.left},0)`}
					ref={(node) => {
						if (node) {
							const axis = d3.select(node).call(d3.axisLeft(y));
							axis.selectAll('text').attr('fill', '#fff');
							axis.selectAll('line').attr('stroke', '#fff');
							axis.selectAll('path').attr('stroke', '#fff');
						}
					}}
				/>

				<path
					fill='none'
					stroke='#22c55e'
					strokeWidth='2.5'
					d={d3
						.line()
						.x((_, i) => x(dates[i]))
						.y((_, i) => y(buyCounts[i]))
						.curve(d3.curveMonotoneX)(buyCounts)}
				/>

				<path
					fill='none'
					stroke='#ef4444'
					strokeWidth='2.5'
					d={d3
						.line()
						.x((_, i) => x(dates[i]))
						.y((_, i) => y(sellCounts[i]))
						.curve(d3.curveMonotoneX)(sellCounts)}
				/>

				{buyCounts.map((count, i) => (
					<circle
						key={`b-${i}`}
						cx={x(dates[i])}
						cy={y(count)}
						r={10}
						fill='transparent'
						onMouseEnter={() =>
							setTooltip({
								x: x(dates[i]),
								y: y(count),
								date: dates[i],
								value: count,
								type: 'Buy',
								color: '#22c55e',
							})
						}
						onMouseLeave={() => setTooltip(null)}
					/>
				))}

				{sellCounts.map((count, i) => (
					<circle
						key={`s-${i}`}
						cx={x(dates[i])}
						cy={y(count)}
						r={10}
						fill='transparent'
						onMouseEnter={() =>
							setTooltip({
								x: x(dates[i]),
								y: y(count),
								date: dates[i],
								value: count,
								type: 'Sell',
								color: '#ef4444',
							})
						}
						onMouseLeave={() => setTooltip(null)}
					/>
				))}

				{tooltip && (
					<g
						transform={`translate(${tooltip.x + 10}, ${
							tooltip.y - 10
						})`}>
						<rect
							width='120'
							height='55'
							fill='#111827'
							rx='6'
							opacity='0.85'
						/>
						<text x='10' y='20' fill='white' fontSize='12'>
							{tooltip.type}: {tooltip.value}
						</text>
						<text x='10' y='38' fill='#d1d5db' fontSize='11'>
							{tooltip.date.toLocaleDateString()}
						</text>
					</g>
				)}
			</svg>

			{brushStats && (
				<div
					className='absolute bg-black/80 text-white p-3 rounded-lg text-sm'
					style={{
						left: brushStats.x0 + 10,
						top: margin.top + 10,
					}}>
					<div className='font-bold mb-1'>Selected Range:</div>
					<div>
						{brushStats.start.toLocaleDateString()} {' -> '}
						{brushStats.end.toLocaleDateString()}
					</div>
					<div className='text-green-400'>
						Buy Total: {brushStats.buyTotal.toLocaleString()}
					</div>
					<div className='text-red-400'>
						Sell Total: {brushStats.sellTotal.toLocaleString()}
					</div>
				</div>
			)}
		</div>
	);
}
