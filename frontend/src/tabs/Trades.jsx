import { useEffect } from 'react';
import ActionPieChart from '../charts/ActionPieChart';
import BuySellLineChart from '../charts/BuySellLineChart';
import StockWordCloud from '../charts/WordCloud';

export default function Trades({ data }) {
	return (
		<div className='flex flex-col gap-10'>
			<div className='flex justify-evenly'>
				<div className='flex flex-col items-center bg-tile rounded-3xl w-[33%] pt-10 text-[#e0e0e0]'>
					<h1 className='font-bold text-white'>
						What are they doing?
					</h1>
					<p className='px-10 indent-8'>
						As members of congress, our representatives are privvy
						to information that the average citizen is not. They're
						aware of what legislation is likely to be passed soon,
						what government contracts are being awarded, and how it
						will affect each company.
					</p>

					<p className='px-10 indent-8'>
						On this page, we explore exactly which stocks are being
						traded and when. This can give us insight into the
						overall trends and patterns present in the financial
						dealings of 535 representatives.
					</p>
				</div>
				<div className='bg-tile rounded-3xl'>
					<h1 className='text-center text-white font-bold pt-5'>
						Stock Purhcases and Sales since Jan. 2023 (By date)
					</h1>
					<BuySellLineChart data={data} />
				</div>
			</div>
			<div className='flex justify-evenly'>
				<div className='bg-tile rounded-3xl'>
					<h1 className='text-center text-white font-bold pt-5'>
						Most traded stocks (by volume)
					</h1>
					<StockWordCloud data={data} />
				</div>
				<div className='flex flex-col  items-center bg-tile rounded-3xl w-[33%] justify-center'>
					<h1 className='text-center text-white font-bold pt-5'>
						Stock Purhcases and Sales since Jan. 2023 (By volume)
					</h1>
					<ActionPieChart data={data} />
				</div>
			</div>
		</div>
	);
}
