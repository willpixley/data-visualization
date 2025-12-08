import PerformanceLineChart from '../charts/PerformanceLineChart';
import ThreeD from '../charts/ThreeD';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { formatDate } from '../utils/lib';

export default function Performance({ data }) {
	const [stockHistory, setStockHistory] = useState(null);
	const [selectedTrade, setSelectedTrade] = useState(data[0]);
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredTrades, setFilteredTrades] = useState([]);

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

	function selectTradeByTicker() {
		if (!searchTerm) return;

		const sixMonthsAgo = new Date();
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

		// Filter trades within the last 6 months
		const recentTrades = data.filter((trade) => {
			const d = new Date(trade.trade_date);
			return d >= sixMonthsAgo;
		});

		// Get all trades matching the entered ticker
		const matches = recentTrades.filter(
			(t) => t.stock_ticker.toUpperCase() === searchTerm
		);

		if (matches.length === 0) {
			alert('No trades found for that ticker in the last 6 months');
			setFilteredTrades([]);
			return;
		}

		setFilteredTrades(matches);
		setSelectedTrade(matches[0]); // default to first match
	}

	return (
		<div>
			<h1 className='text-center w-full text-text text-3xl font-bold my-3'>
				Trade Performance
			</h1>
			<div className='w=full flex justify-between'>
				<ThreeD />
				<div className='text-text'>
					<div className='bg-tile flex flex-col p-4 rounded-3xl  mb-8'>
						<h2 className='font-semibold'>Axes Guide</h2>
						<p>
							X axis: Date (Oldest on left to most recent on
							right)
						</p>
						<p>Y axis: Price per share (USD)</p>
						<p>Z axis: Stock ticker</p>
					</div>
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
					<br />
				</div>
			</div>
			<div id='line-chart' className='w-full bg-tile  rounded-3xl p-4'>
				<h1 className='text-center w-full text-3xl mt-3 mb-6 font-bold text-text'>
					Individual Trade Performance
				</h1>
				<div id='choose-trade' className='flex justify-evenly w-full'>
					<div className='flex flex-col items-center bg-background w-[45%] rounded-3xl p-4 pb-8 text-text'>
						<p className='font-bold text-2xl my-3'>
							Search by stock ticker
						</p>
						<div className='flex items-center justify-evenly w-full mt-2'>
							<input
								type='text'
								placeholder='Enter stock ticker (last 6 months)'
								value={searchTerm}
								onChange={(e) =>
									setSearchTerm(e.target.value.toUpperCase())
								}
								className='px-3 py-2 rounded-2xl border border-gray-400 w-[50%] text-text'
							/>
							<button
								onClick={selectTradeByTicker}
								className='font-bold px-6 py-2 rounded-2xl bg-green-700 hover:bg-green-900 cursor-pointer'>
								Search
							</button>
						</div>

						{filteredTrades.length > 1 && (
							<div className='mt-5 flex justify-evenly items-center w-full'>
								<p className='font-semibold '>
									Select a specific trade:
								</p>
								<select
									value={selectedTrade?.trade_date}
									onChange={(e) => {
										const trade = filteredTrades.find(
											(t) =>
												t.trade_date === e.target.value
										);
										setSelectedTrade(trade);
									}}
									className='px-3 py-2 rounded-2xl border border-gray-400 w-64'>
									{filteredTrades.map((trade) => (
										<option
											key={
												trade.trade_date +
												trade.member_name
											}
											value={trade.trade_date}>
											{trade.member_name} —{' '}
											{formatDate(trade.trade_date)} — $
											{Number(
												trade.amount
											).toLocaleString()}
										</option>
									))}
								</select>
							</div>
						)}
					</div>
					<div className='flex flex-col items-left w-[45%]  text-text bg-background rounded-3xl pb-8 pt-3 px-8'>
						<h1 className='font-bold text-center w-full text-2xl my-3'>
							Trade Details{' '}
							{selectedTrade.flagged == 'True' && '🚩'}
						</h1>
						<div className='flex justify-between mb-3 items-center'>
							<p>
								{selectedTrade.member_name} |{' '}
								{selectedTrade.member_party[0]}
							</p>
							<p className='w-[60%] truncate'>
								{selectedTrade.committee_names}
							</p>
						</div>
						<div className='flex justify-between mb-3 items-center'>
							<p
								className={`rounded-2xl px-3 py-1 ${
									selectedTrade.action == 'b'
										? 'bg-green-800'
										: 'bg-red-700'
								}`}>
								{selectedTrade.action == 'b' ? 'Buy' : 'Sell'}
							</p>
							<p>
								~$
								{Number(selectedTrade.amount).toLocaleString()}
							</p>
						</div>
						<div className='flex justify-between items-center'>
							<p>
								{selectedTrade.stock_name} (
								{selectedTrade.stock_ticker})
							</p>
							<p>{formatDate(selectedTrade.trade_date)}</p>
						</div>
					</div>
				</div>
				<div className='flex justify-between gap-4 w-full p-4'>
					<div className='w-full flex flex-col items-center'>
						<h1 className='text-text font-semi text-xl mb-3'>
							{selectedTrade.stock_ticker} &mdash; 6 month
							performance
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
		</div>
	);
}
