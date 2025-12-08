import { useState, useEffect } from 'react';
import Trades from './tabs/Trades';
import Performance from './tabs/Performance';
import Who from './tabs/Who';
import * as Papa from 'papaparse';

export default function Dashboard() {
	const [tab, setTab] = useState(0);
	const [data, setData] = useState(null);
	const [blurred, setBlurred] = useState(false);
	const tabs = [
		{
			title: 'Who',
			component: <Who setBlurred={setBlurred} data={data} />,
		}, // map, congressmen
		{
			title: 'What',
			component: <Trades setBlurred={setBlurred} data={data} />,
		}, // trade list and stock info

		{ title: 'Why', component: <Performance data={data} /> }, // returns and performance
	];
	useEffect(() => {
		async function fetchData() {
			const response = await fetch('./trade_data.csv');
			const resText = await response.text();
			const text = Papa.parse(resText, { header: true }).data;
			setData(text);
		}

		fetchData();
	}, []);
	return (
		<div
			className={`w-full min-h-screen bg-background text-inverse relative ${
				blurred && ''
			}`}>
			{/* --- Tabs --- */}
			<div className='flex gap-4 items-center justify-center pt-10 text-center border-gray-300'>
				{tabs.map((t, i) => (
					<button
						key={i}
						onClick={() => setTab(i)}
						className={`py-1 px-4 rounded-full text-center ${
							tab === i
								? 'border-2 font-semibold bg-gray-300 ease-in-out'
								: 'text-gray-300 hover:bg-gray-500'
						}`}>
						{t.title}
					</button>
				))}
			</div>

			{/* --- Tab Content --- */}
			{data && <div className='p-4'>{tabs[tab].component}</div>}

			{/* --- Blur Overlay --- */}
			{blurred && (
				<div className='fixed inset-0 backdrop-blur-xl bg-black/20 z-20 ' />
			)}
		</div>
	);
}
