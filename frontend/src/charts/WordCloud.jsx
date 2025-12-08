import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { formatDate } from '../utils/lib';

export default function StockWordCloud({
	setBlurred,
	data,
	width = 800,
	height = 400,
}) {
	const svgRef = useRef();
	const [selectedTicker, setSelectedTicker] = useState(null);
	const [hovered, setHovered] = useState(null); // <-- NEW

	const tradesForTicker = selectedTicker
		? data.filter((d) => d.stock_ticker === selectedTicker)
		: [];

	useEffect(() => {
		if (selectedTicker) {
			setBlurred(true);
		}
	}, [selectedTicker]);
	useEffect(() => {
		if (!data || data.length === 0) return;

		const totals = d3.rollup(
			data,
			(v) => d3.sum(v, (d) => +d.amount),
			(d) => d.stock_ticker
		);

		const words = Array.from(totals, ([text, value]) => ({ text, value }));

		const fontScale = d3
			.scaleSqrt()
			.domain([0, d3.max(words, (d) => d.value)])
			.range([10, 60]);

		const layout = cloud()
			.size([width, height])
			.words(words)
			.padding(5)
			.rotate(
				() =>
					(Math.random() < 0.5 ? 1 : -1) *
					Math.floor(Math.random() * 65)
			)
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
				.style('cursor', 'pointer')
				.attr('text-anchor', 'middle')
				.attr(
					'transform',
					(d) => `translate(${d.x},${d.y}) rotate(${d.rotate})`
				)
				.text((d) => d.text)
				.on('mouseenter', (event, d) => {
					setHovered({
						ticker: d.text,
						value: d.value,
						x: event.clientX,
						y: event.clientY,
					});
				})
				.on('mousemove', (event, d) => {
					setHovered((h) =>
						h ? { ...h, x: event.clientX, y: event.clientY } : null
					);
				})
				.on('mouseleave', () => setHovered(null))
				.on('click', (event, d) => {
					setSelectedTicker(d.text);
				});
		}
	}, [data, width, height]);

	return (
		<>
			<svg ref={svgRef} />

			{hovered && (
				<div
					className='fixed z-50 pointer-events-none bg-black/80 text-white text-sm px-3 py-1 rounded'
					style={{
						left: hovered.x + 12,
						top: hovered.y + 12,
					}}>
					<div className='font-semibold'>{hovered.ticker}</div>
					<div>Volume: ${Number(hovered.value).toLocaleString()}</div>
				</div>
			)}

			{selectedTicker && (
				<div
					className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center'
					onClick={() => setSelectedTicker(null)}>
					<div
						className='bg-tile rounded-lg shadow-xl p-6 w-[400px] max-h-[70vh] overflow-y-auto'
						onClick={(e) => e.stopPropagation()}>
						<h2 className='text-xl text-text font-semibold mb-3'>
							Trades for {tradesForTicker[0].stock_name} (
							{selectedTicker})
						</h2>

						{tradesForTicker.map((t, i) => (
							<div
								key={i}
								className='border-b py-2 text-sm text-text'>
								<div>
									<b>Date:</b> {formatDate(t.trade_date)}
								</div>
								<div>
									<b>Action:</b>{' '}
									{t.action === 'b' ? 'Buy' : 'Sell'}
								</div>
								<div>
									<b>Amount:</b> $
									{Number(t.amount).toLocaleString()}
								</div>
								<div>
									<b>Representative: </b> {t.member_name}
								</div>
							</div>
						))}

						<button
							className='mt-4 px-4 py-2 bg-red-800 text-white rounded cursor-pointer'
							onClick={() => {
								setSelectedTicker(null);
								setBlurred(false);
							}}>
							Close
						</button>
					</div>
				</div>
			)}
		</>
	);
}
