import { useMemo, useState } from 'react';
import * as d3 from 'd3';

export default function ActionPieChart({
	selectedSector,
	setSelectedSector,
	data,
}) {
	const [hovered, setHovered] = useState(null);

	// top 6 sectors
	const sectorCounts = useMemo(() => {
		const totals = d3.rollups(
			data,
			(v) => d3.sum(v, (d) => +d.amount),
			(d) => d.sector_name
		);

		totals.sort((a, b) => b[1] - a[1]);

		const topSix = totals.slice(0, 6);
		const otherTotal = totals.slice(6).reduce((sum, d) => sum + d[1], 0);

		if (otherTotal > 0) topSix.push(['Other', otherTotal]);

		return topSix;
	}, [data]);

	const pie = d3.pie().value((d) => d[1]);
	const arcs = pie(sectorCounts);

	const arcGen = d3.arc().innerRadius(0).outerRadius(120);

	const colors = d3
		.scaleOrdinal()
		.domain(sectorCounts.map((d) => d[0]))
		.range(d3.schemeTableau10);

	return (
		<div className='flex gap-6'>
			{/* Pie Chart */}
			<div className='relative'>
				<svg width={300} height={300}>
					<g transform='translate(150,150)'>
						{arcs.map((arc, i) => {
							const sector = arc.data[0];
							const isSelected = selectedSector === sector;

							return (
								<path
									key={i}
									d={arcGen(arc)}
									fill={colors(sector)}
									stroke='white'
									strokeWidth={isSelected ? 4 : 2}
									opacity={
										selectedSector && !isSelected ? 0.35 : 1
									}
									style={{ cursor: 'pointer' }}
									onClick={() =>
										setSelectedSector(
											isSelected ? null : sector
										)
									}
									onMouseEnter={(e) =>
										setHovered({
											sector,
											value: arc.data[1],
											x: e.clientX,
											y: e.clientY,
										})
									}
									onMouseMove={(e) =>
										setHovered((h) =>
											h
												? {
														...h,
														x: e.clientX,
														y: e.clientY,
												  }
												: null
										)
									}
									onMouseLeave={() => setHovered(null)}
								/>
							);
						})}
					</g>
				</svg>

				{/* Tooltip */}
				{hovered && (
					<div
						className='fixed z-50 pointer-events-none bg-black/80 text-white text-sm px-3 py-1 rounded'
						style={{
							left: hovered.x + 10,
							top: hovered.y + 10,
						}}>
						<div className='font-semibold'>{hovered.sector}</div>
						<div>${hovered.value.toLocaleString()}</div>
					</div>
				)}
			</div>

			{/* Legend */}
			<div className='flex flex-col justify-center gap-2'>
				{sectorCounts.map(([sector, value], i) => (
					<div
						key={i}
						className='flex items-center gap-2 text-text'
						style={{
							opacity:
								selectedSector && selectedSector !== sector
									? 0.4
									: 1,
						}}>
						<div
							style={{ backgroundColor: colors(sector) }}
							className='w-4 h-4 rounded'
						/>
						<div className='text-sm'>
							{sector} (${value.toLocaleString()})
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
