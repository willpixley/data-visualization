import { useMemo } from 'react';
import * as d3 from 'd3';

export default function ActionPieChart({ data }) {
	const counts = useMemo(() => {
		return d3.rollups(
			data,
			(v) => d3.sum(v, (d) => +d.amount),
			(d) => (d.action === 'b' ? 'Buy' : 'Sell')
		);
	}, [data]);

	const pie = d3.pie().value((d) => d[1]);
	const arcs = pie(counts);

	const arcGen = d3.arc().innerRadius(0).outerRadius(120);

	const colors = d3
		.scaleOrdinal()
		.domain(['Buy', 'Sell'])
		.range(['#0fab0c', '#ef4444']); // green + red

	return (
		<svg width={300} height={300}>
			<g transform='translate(150,150)'>
				{arcs.map((arc, i) => (
					<path
						key={i}
						d={arcGen(arc)}
						fill={colors(arc.data[0])}
						stroke='white'
						strokeWidth={2}></path>
				))}

				{arcs.map((arc, i) => (
					<text
						key={i}
						transform={`translate(${arcGen.centroid(arc)})`}
						textAnchor='middle'
						fontSize='14'
						fill='#000'>
						${arc.data[1].toLocaleString()}
					</text>
				))}
			</g>
		</svg>
	);
}
