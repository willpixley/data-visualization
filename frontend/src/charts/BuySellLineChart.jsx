import { useMemo } from 'react';
import * as d3 from 'd3';

export default function BuySellLineChart({ data }) {
	const { dates, buyCounts, sellCounts } = useMemo(() => {
		const parsed = data.map((d) => ({
			date: new Date(d.trade_date),
			action: d.action,
		}));

		// Rollups by day
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

		// Merge all dates
		const allDates = Array.from(
			new Set([...buys.keys(), ...sells.keys()])
		).sort((a, b) => a - b);

		return {
			dates: allDates,
			buyCounts: allDates.map((d) => buys.get(d) ?? 0),
			sellCounts: allDates.map((d) => sells.get(d) ?? 0),
		};
	}, [data]);

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

	const lineBuy = d3
		.line()
		.x((_, i) => x(dates[i]))
		.y((d) => y(buyCounts[buyCounts.indexOf(d)]))
		.curve(d3.curveMonotoneX);

	const lineSell = d3
		.line()
		.x((_, i) => x(dates[i]))
		.y((d) => y(sellCounts[sellCounts.indexOf(d)]))
		.curve(d3.curveMonotoneX);

	return (
		<svg width={width} height={height}>
			{/* x axis */}
			<g
				transform={`translate(0,${height - margin.bottom})`}
				ref={(node) => {
					if (node) d3.select(node).call(d3.axisBottom(x).ticks(7));
				}}
			/>

			{/* y axis */}
			<g
				transform={`translate(${margin.left},0)`}
				ref={(node) => {
					if (node) d3.select(node).call(d3.axisLeft(y));
				}}
			/>

			{/* buy line */}
			<path
				fill='none'
				stroke='#22c55e' /* greenish */
				strokeWidth='2.5'
				d={d3
					.line()
					.x((d, i) => x(dates[i]))
					.y((d) => y(buyCounts[d]))
					.curve(d3.curveMonotoneX)(buyCounts.map((_, i) => i))}
			/>

			{/* sell line */}
			<path
				fill='none'
				stroke='#ef4444' /* red-500 */
				strokeWidth='2.5'
				d={d3
					.line()
					.x((d, i) => x(dates[i]))
					.y((d) => y(sellCounts[d]))
					.curve(d3.curveMonotoneX)(sellCounts.map((_, i) => i))}
			/>

			{/* labels */}
			<text x={width - 120} y={40} fill='#22c55e' fontSize='14'>
				● Buys
			</text>
			<text x={width - 120} y={60} fill='#ef4444' fontSize='14'>
				● Sells
			</text>
		</svg>
	);
}
