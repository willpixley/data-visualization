import * as d3 from 'd3';

export function Legend() {
	const width = 260;
	const height = 60;

	const domain = [0, 1_000_000, 5_000_000, 23_000_000];
	const range = ['#f7fcf5', '#bae4b3', '#41ab5d', '#005a32'];

	const svg = d3.create('svg').attr('width', width).attr('height', height);

	const stepWidth = width / range.length;

	// Draw color boxes
	svg.selectAll('rect')
		.data(range)
		.enter()
		.append('rect')
		.attr('x', (d, i) => i * stepWidth)
		.attr('y', 20)
		.attr('width', stepWidth)
		.attr('height', 20)
		.attr('fill', (d) => d);

	// Labels for domain breakpoints
	svg.selectAll('text')
		.data(domain)
		.enter()
		.append('text')
		.attr('x', (d, i) => i * stepWidth)
		.attr('y', 55)
		.attr('font-size', '10px')
		.attr('fill', 'white')
		.text((d) => d.toLocaleString());

	// Title
	svg.append('text')
		.attr('x', 0)
		.attr('y', 12)
		.attr('font-size', '12px')
		.attr('font-weight', '600')
		.attr('fill', 'white')
		.text('Trade Volume');

	return svg.node();
}
