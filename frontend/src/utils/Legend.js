// src/utils/Legend.js

import * as d3 from 'd3';

export function Legend(
	color,
	{
		title,
		tickSize = 6,
		width = 320,
		height = 44 + tickSize,
		marginTop = 18,
		marginRight = 0,
		marginBottom = 16 + tickSize,
		marginLeft = 0,
		ticks = width / 64,
		tickFormat,
		tickValues,
		maxVol,
	} = {}
) {
	const svg = d3
		.create('svg')
		.attr('width', width)
		.attr('height', height)
		.attr('viewBox', [0, 0, width, height])
		.style('display', 'block');

	let x;

	// Continuous scale
	if (color.interpolator) {
		x = Object.assign(
			d3
				.scaleLinear()
				.domain(color.domain())
				.range([marginLeft, width - marginRight]),
			{ ticks }
		);

		svg.append('image')
			.attr('x', marginLeft)
			.attr('y', marginTop)
			.attr('width', width - marginLeft - marginRight)
			.attr('height', height - marginTop - marginBottom)
			.attr('preserveAspectRatio', 'none')
			.attr('xlink:href', ramp(color.interpolator()).toDataURL());
	}
	// Ordinal scale
	else if (color.invertExtent) {
		const thresholds = color.thresholds
			? color.thresholds()
			: color.quantiles
			? color.quantiles()
			: color.domain();

		x = d3
			.scaleLinear()
			.domain([-1, thresholds.length])
			.range([marginLeft, width - marginRight]);

		svg.append('g')
			.selectAll('rect')
			.data(
				color.range().map((d, i) => {
					return {
						color: d,
						x0: x(i - 1),
						x1: x(i),
					};
				})
			)
			.join('rect')
			.attr('x', (d) => d.x0)
			.attr('y', marginTop)
			.attr('width', (d) => d.x1 - d.x0)
			.attr('height', height - marginTop - marginBottom)
			.attr('fill', (d) => d.color);
	}

	// Axis
	svg.append('g')
		.attr('transform', `translate(0,${height - marginBottom})`)
		.call(d3.axisBottom(x).ticks(0, maxVol))
		.call((g) => g.select('.domain').remove())
		.call((g) =>
			g
				.append('text')
				.attr('y', -22)
				.attr('fill', 'currentColor')
				.attr('text-anchor', 'start')
				.text(title)
		);

	return svg.node();
}

function ramp(color, n = 256) {
	const canvas = document.createElement('canvas');
	canvas.width = n;
	canvas.height = 1;
	const context = canvas.getContext('2d');

	for (let i = 0; i < n; ++i) {
		context.fillStyle = color(i / (n - 1));
		context.fillRect(i, 0, 1, 1);
	}
	return canvas;
}
