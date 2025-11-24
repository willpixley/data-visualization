import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

export default function StockWordCloud({ data, width = 800, height = 400 }) {
	const svgRef = useRef();

	useEffect(() => {
		if (!data || data.length === 0) return;

		const totals = d3.rollup(
			data,
			(v) => d3.sum(v, (d) => +d.amount),
			(d) => d.stock_name
		);

		const words = Array.from(totals, ([text, value]) => ({ text, value }));

		// Scale font size
		const fontScale = d3
			.scaleSqrt()
			.domain([0, d3.max(words, (d) => d.value)])
			.range([10, 60]); // min/max font size

		const layout = cloud()
			.size([width, height])
			.words(words)
			.padding(5)
			.rotate(() => (Math.random() > 0.5 ? 0 : 90))
			.font('Impact')
			.fontSize((d) => fontScale(d.value))
			.on('end', draw);

		layout.start();

		function draw(words) {
			d3.select(svgRef.current).selectAll('*').remove();

			const svg = d3
				.select(svgRef.current)
				.attr('width', width)
				.attr('height', height)
				.append('g')
				.attr('transform', `translate(${width / 2},${height / 2})`);

			svg.selectAll('text')
				.data(words)
				.enter()
				.append('text')
				.style('font-size', (d) => `${d.size}px`)
				.style('font-family', 'Impact')
				.style('fill', (_, i) => d3.schemeCategory10[i % 10])
				.attr('text-anchor', 'middle')
				.attr(
					'transform',
					(d) => `translate(${d.x},${d.y}) rotate(${d.rotate})`
				)
				.text((d) => d.text);
		}
	}, [data, width, height]);

	return <svg ref={svgRef}></svg>;
}
