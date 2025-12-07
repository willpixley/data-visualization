import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Legend } from '../utils/Legend.js';
import './map.css';
import Popout from '../Popout.jsx';

const steps = [
	{
		title: 'United States overview',
		text: 'This map shows unemployment rates across all U.S. states. Use Next to focus on specific regions.',
		tagline: 'All states highlighted',
		states: [],
	},
	{
		title: 'West Coast',
		text: 'West Coast states (California, Oregon, Washington) often show distinct unemployment patterns.',
		tagline: 'Focus: CA, OR, WA',
		states: ['06', '41', '53'],
	},
	{
		title: 'Northeast',
		text: 'Northeastern states tend to cluster together on many socioeconomic indicators, including unemployment.',
		tagline: 'Focus: CT, ME, MA, NH, NJ, NY, PA, RI, VT',
		states: ['09', '23', '25', '33', '34', '36', '42', '44', '50'],
	},
	{
		title: 'South',
		text: 'Southern states present another regional pattern, with some of the highest and lowest unemployment rates side by side.',
		tagline: 'Focus: AL, AR, DE, FL, GA, KY, LA, MS, NC, SC, TN, TX',
		states: [
			'01',
			'05',
			'10',
			'12',
			'13',
			'21',
			'22',
			'28',
			'37',
			'45',
			'47',
			'48',
		],
	},
];

const stateNames = {
	AL: 'Alabama',
	AK: 'Alaska',
	AZ: 'Arizona',
	AR: 'Arkansas',
	CA: 'California',
	CO: 'Colorado',
	CT: 'Connecticut',
	DE: 'Delaware',
	FL: 'Florida',
	GA: 'Georgia',
	HI: 'Hawaii',
	ID: 'Idaho',
	IL: 'Illinois',
	IN: 'Indiana',
	IA: 'Iowa',
	KS: 'Kansas',
	KY: 'Kentucky',
	LA: 'Louisiana',
	ME: 'Maine',
	MD: 'Maryland',
	MA: 'Massachusetts',
	MI: 'Michigan',
	MN: 'Minnesota',
	MS: 'Mississippi',
	MO: 'Missouri',
	MT: 'Montana',
	NE: 'Nebraska',
	NV: 'Nevada',
	NH: 'New Hampshire',
	NJ: 'New Jersey',
	NM: 'New Mexico',
	NY: 'New York',
	NC: 'North Carolina',
	ND: 'North Dakota',
	OH: 'Ohio',
	OK: 'Oklahoma',
	OR: 'Oregon',
	PA: 'Pennsylvania',
	RI: 'Rhode Island',
	SC: 'South Carolina',
	SD: 'South Dakota',
	TN: 'Tennessee',
	TX: 'Texas',
	UT: 'Utah',
	VT: 'Vermont',
	VA: 'Virginia',
	WA: 'Washington',
	WV: 'West Virginia',
	WI: 'Wisconsin',
	WY: 'Wyoming',
};

export default function MapStory({ data }) {
	const chartRef = useRef(null);
	const [activeStepIndex, setActiveStepIndex] = useState(0);
	const statePathMap = useRef(new Map());
	const allStates = useMemo(() => Object.values(stateNames), []);
	const [selectedState, setSelectedState] = useState(null);
	const [members, setMembers] = useState([]);
	const [allMemberData, setAllMemberData] = useState([]);
	const [selectedMember, setSelectedMember] = useState(null);
	const tooltipRef = useRef(null);

	const currentStep = steps[activeStepIndex];
	useEffect(() => {
		async function loadMembersCSV() {
			const rows = await d3.csv('/member_info.csv');
			setAllMemberData(rows);
		}
		loadMembersCSV();
	}, []);

	async function loadAndAggregate() {
		const csvData = await d3.csv('/trade_data.csv', (d) => ({
			...d,
			amount: +d.amount,
			member_state: d.member_state,
		}));
		const totals = d3.rollup(
			csvData,
			(v) => d3.sum(v, (d) => d.amount),
			(d) => stateNames[d.member_state] || d.member_state
		);
		return allStates.map((state) => ({
			name: state,
			volume: totals.get(state) ?? 0,
		}));
	}
	useEffect(() => {
		if (!selectedState || allMemberData.length === 0) {
			setMembers([]);
			return;
		}

		const state = selectedState.name;

		const tradesForState = allMemberData.filter(
			(row) =>
				row.member_state === selectedState.id ||
				row.member_state === state
		);

		const memberMap = new Map();

		for (const row of tradesForState) {
			if (!memberMap.has(row.member_bio_guide_id)) {
				memberMap.set(row.member_bio_guide_id, {
					id: row.member_bio_guide_id,
					name: row.member_name,
					chamber: row.member_chamber,
					party: row.member_party,
					state: row.member_state,
					imageUrl: row.photo_url,
					volume: row.total_trade_volume,
					trades: [],
				});
			}

			// pull from main data source
			const memberTrades = data.filter(
				(trade) => trade.member_bio_guide_id === row.member_bio_guide_id
			);

			memberMap.get(row.member_bio_guide_id).trades = memberTrades;
		}

		// Convert map to array
		const membersWithTrades = Array.from(memberMap.values());
		setMembers(membersWithTrades);
	}, [selectedState, allMemberData]);
	console.log(allMemberData);

	// Draw chart only once
	useEffect(() => {
		let svg; // store svg reference

		async function init() {
			const trades = await loadAndAggregate();
			const us = await d3.json('/counties-albers-10m.json');

			const namemap = new Map(
				us.objects.states.geometries.map((d) => [
					d.properties.name,
					d.id,
				])
			);
			const maxVol = Math.max(...trades.map((d) => d.volume));
			const color = d3
				.scaleLinear()
				.domain([0, 1_000_000, 5_000_000, 23_000_000])
				.range(['#f7fcf5', '#c7e9c0', '#74c476', '#00441b']);
			const path = d3.geoPath();
			const valuemap = new Map(
				trades.map((d) => [namemap.get(d.name), d.volume])
			);

			svg = d3
				.select(chartRef.current)
				.append('svg')
				.attr('width', 975)
				.attr('height', 610)
				.attr('viewBox', [0, 0, 975, 610])
				.style('max-width', '100%')
				.style('height', 'auto');

			// Legend
			svg.append('g')
				.attr('transform', 'translate(610,20)')
				.append(() =>
					Legend(color, { title: 'Trade Volume', width: 260, maxVol })
				);
			const tooltip = d3.select(tooltipRef.current);

			const states = topojson.feature(us, us.objects.states);

			svg.append('g')
				.selectAll('path')
				.data(states.features)
				.join('path')
				.attr('class', 'state')
				.attr('fill', (d) => color(valuemap.get(d.id)))
				.attr('d', path)
				.each(function (d) {
					const key = String(d.id).padStart(2, '0');
					statePathMap.current.set(key, d3.select(this));
				})
				.on('mouseover', (event, d) => {
					const volume = valuemap.get(d.id) ?? 0;
					tooltip
						.style('opacity', 1)
						.html(
							`<strong>${
								d.properties.name
							}</strong><br/>Volume: $${volume.toLocaleString()}`
						);
				})
				.on('mousemove', (event) => {
					tooltip
						.style('left', `${event.pageX + 10}px`)
						.style('top', `${event.pageY + 10}px`);
				})
				.on('mouseout', () => {
					tooltip.style('opacity', 0);
				})
				.on('click', (event, d) => {
					const id = String(d.id).padStart(2, '0');
					setSelectedState({
						id,
						name: d.properties.name,
						volume: valuemap.get(d.id) ?? 0,
					});
				});

			svg.append('path')
				.datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
				.attr('fill', 'none')
				.attr('stroke', 'white')
				.attr('stroke-linejoin', 'round')
				.attr('d', path);
		}

		init();

		return () => {
			// Cleanup: remove SVG if component unmounts or remounts
			if (svg) svg.remove();
		};
	}, []);

	useEffect(() => {
		highlightStates();
	}, [selectedState]);

	function highlightStates() {
		const all = d3.select(chartRef.current).selectAll('.state');
		all.classed('selected', false);
		console.log(selectedState);

		if (!selectedState) {
			all.classed('dimmed', false).classed('highlighted', true);
		} else {
			all.classed('highlighted', false).classed('dimmed', true);
			const key = selectedState.id;
			console.log(statePathMap.current);
			const sel = statePathMap.current.get(key);
			if (sel) sel.classed('highlighted', true).classed('dimmed', false);
		}
	}

	console.log(members);

	return (
		<>
			{selectedMember && (
				<Popout
					member={selectedMember}
					setSelectedMember={setSelectedMember}
				/>
			)}
			<div
				className={`w-full ${
					selectedMember && 'blur-xl pointer-events-none'
				}`}>
				<h1 className='text-center text-3xl text-text font-bold my-3'>
					Trade Volume by State
				</h1>
				<div className={`w-full flex justify-evenly `}>
					<div ref={chartRef} className='' />
					<div
						ref={tooltipRef}
						className='absolute pointer-events-none bg-gray-800 text-white text-sm p-2 rounded opacity-0 transition-opacity z-50'></div>

					<div className='pr-5 flex flex-col  gap-3 items-center border-2 p-5 m-5 bg-tile rounded-xl shadow-lg text-text w-[20%]'>
						{selectedState ? (
							<>
								<h3 className='font-bold text-3xl'>
									{selectedState.name}
								</h3>
								<p className=''>
									Total Trade Volume: $
									{selectedState.volume.toLocaleString()}
								</p>
								{members
									.slice()
									.sort((a, b) => b.volume - a.volume)
									.map((member) => (
										<div
											className='flex  px-3 py-1 cursor-pointer justify-between w-full items-center rounded-3xl hover:bg-gray-700'
											key={member.id}
											onClick={() => {
												setSelectedMember(member);
											}}>
											<img
												className='w-12 h-12 object-cover rounded-full'
												src={member.imageUrl}
											/>
											<p className='text-xs text-right'>
												{member.name} | $
												{Number(
													member.volume
												).toLocaleString()}
											</p>
										</div>
									))}
								<button
									className='cursor-pointer my-4  px-3 py-1 text-text hover:bg-red-800  text-center bg-red-600 rounded-full '
									onClick={() => setSelectedState(null)}>
									Close
								</button>
							</>
						) : (
							<p className='font-bold'>
								Click a state to view details
							</p>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
