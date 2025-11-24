import { useState, useEffect } from 'react';
import Trades from './tabs/Trades';
import Performance from './tabs/Performance';
import Who from './tabs/Who';
import * as Papa from 'papaparse';

export default function Dashboard() {
	const [tab, setTab] = useState(2);
	const [data, setData] = useState(null);
	const tabs = [
		{ title: 'Who', component: <Who /> }, // map, congressmen
		{ title: 'What', component: <Trades data={data} /> }, // trade list and stock info

		{ title: 'Why', component: <Performance /> }, // returns and performance
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
		<div className='w-full bg-background text-inverse min-h-full'>
			{/* --- Tabs --- */}
			<div className='flex gap-4  items-center text-center border-gray-300  justify-center pt-10'>
				{tabs.map((t, i) => (
					<button
						key={i}
						onClick={() => setTab(i)}
						className={`py-1 px-4 text-center 
                            ${
								tab === i
									? 'border-2 rounded-full ease-in-out font-semibold bg-gray-300'
									: 'text-gray-300 hover:bg-gray-500 rounded-full '
							}
                        `}>
						{t.title}
					</button>
				))}
			</div>

			{/* --- Tab Content --- */}
			{data && <div className='p-4'>{tabs[tab].component}</div>}
		</div>
	);
}
