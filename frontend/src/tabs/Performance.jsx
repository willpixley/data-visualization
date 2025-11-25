import PerformanceLineChart from '../charts/PerformanceLineChart';
import ThreeD from '../charts/ThreeD';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Performance({ data }) {
	const [stockHistory, setStockHistory] = useState(null);
	const [selectedTrade, setSelectedTrade] = useState(data[0]);
	console.log(selectedTrade);

	useEffect(() => {
		async function getHistory() {
			const res = await axios.get(`http://localhost:8000/stock/history`, {
				params: { ticker: selectedTrade.stock_ticker },
			});
			setStockHistory(res.data.data);
		}

		if (selectedTrade) {
			getHistory();
		}
	}, [selectedTrade]);

	function changeTrade() {
		const sixMonthsAgo = new Date();
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

		// Filter trades within the last 6 months
		const recentTrades = data.filter((trade) => {
			const d = new Date(trade.trade_date);
			return d >= sixMonthsAgo;
		});

		if (recentTrades.length === 0) return; // nothing to pick from

		// Pick a random trade
		const randomTrade =
			recentTrades[Math.floor(Math.random() * recentTrades.length)];

		setSelectedTrade(randomTrade);
	}
	return (
		<div>
			<h1 className='text-center w-full text-text text-3xl font-bold my-3'>
				Trade Performance
			</h1>
			<div className='w=full flex justify-between'>
				<ThreeD />
				<div className='text-text'>
					<h1 className='font-bold text-xl mb-3'>
						About the Plot &#8212; 4 month performance
					</h1>
					<p>
						On July 14, 2025, there were 8 stock purchases by
						members of congress. I've plotted their performance from
						the date of the trade to Novermber 24, 2025. These
						trades are plotted using a red-yellow-green colorscale,
						meaning the read sections are the lowest prices for that
						stock, and green the highest.
					</p>
					<br />
					<p>
						These trades were chosen simply because they all
						occurred on the same date, making them prime candidates
						for visualization. When picking an arbitrary group of
						trades, we can see nearly all hit a peak within a few
						months of being bought by a member of congress.
					</p>
				</div>
			</div>

			<div className='flex justify-between gap-4 w-full p-4'>
				<div className='flex flex-col items-center w-[40%] text-text bg-tile rounded-3xl p-4 '>
					<h1 className='font-bold text-2xl my-3'>
						Individual Trades
					</h1>
					<p>
						{selectedTrade.member_name} |{' '}
						{selectedTrade.member_party[0]}
					</p>
					<p
						className={`rounded-2xl px-3 py-1 ${
							selectedTrade.action == 'b'
								? 'bg-green-800'
								: 'bg-red-700'
						}`}>
						{selectedTrade.action == 'b' ? 'Buy' : 'Sell'}
					</p>
					<p>~${Number(selectedTrade.amount).toLocaleString()}</p>
					<p>
						{selectedTrade.stock_name} ({selectedTrade.stock_ticker}
						)
					</p>
					<p>{selectedTrade.trade_date}</p>
					<p>{selectedTrade.committee_names}</p>
					<button
						onClick={changeTrade}
						className='mt-12 font-bold px-6 py-2 rounded-2xl  bg-green-700 hover:bg-green-900 cursor-pointer'>
						Select a random trade
					</button>
				</div>
				<div className='w-full flex flex-col items-center'>
					<h1 className='text-text font-semi text-xl'>
						{selectedTrade.stock_ticker} 6 month performance
					</h1>
					{stockHistory && selectedTrade && (
						<PerformanceLineChart
							dates={stockHistory.dates}
							prices={stockHistory.prices}
							tradeDate={selectedTrade.trade_date}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
