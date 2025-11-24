import { useEffect } from 'react';
import Plotly from 'plotly.js-dist';
import * as Papa from 'papaparse';

export default function RibbonPlot() {
	useEffect(() => {
		async function fetchData() {
			// Load CSV
			const response = await fetch('/price_data.csv');
			const csvText = await response.text();
			const parsed = Papa.parse(csvText, { header: true }).data;

			const x = parsed.map((row) => row.Date);
			const stocks = Object.keys(parsed[0]).filter(
				(col) => col !== 'Date'
			);
			const redYellowGreen = [
				[0, 'red'],
				[0.5, 'yellow'],
				[1, 'green'],
			];

			// create a ribbon for each stock
			const data = stocks.map((stock, idx) => {
				const z = parsed.map((row) => parseFloat(row[stock]));

				const z2D = [z, z];

				const y = [idx, idx + 0.5];
				return {
					x, // all dates
					y, // 2 rows
					z: z2D, // 2D array
					type: 'surface',
					showscale: false,
					colorscale: redYellowGreen,
					name: stock,
					hovertemplate:
						'Date: %{x}<br>' +
						'Stock: %{y}<br>' +
						'Price: $%{z}<extra></extra>',
				};
			});

			const layout = {
				title: '3D Ribbon Plot',
				width: 1000,
				height: 700,
				scene: {
					camera: {
						eye: { x: -1.6, y: -1.6, z: 0.5 },
						up: { x: 0, y: 0, z: 1 },
						center: { x: -0.15, y: -0.1, z: -0.2 },
					},
					xaxis: {
						title: { text: 'Date' },
					},
					yaxis: {
						title: { text: 'Stock' },
						tickvals: stocks.map((_, i) => i),
						ticktext: stocks,
					},
					zaxis: { title: { text: 'Price' } },
				},
				paper_bgcolor: '#1f1f1f',
				plot_bgcolor: '#1f1f1f',
				margin: { l: 0, r: 0, t: 0, b: 0 },
			};

			Plotly.newPlot('ribbonPlotDiv', data, layout);
		}

		fetchData();
	}, []);

	return <div id='ribbonPlotDiv' className='w-full h-full' />;
}
