import { formatDate } from './utils/lib';
export default function Popout({ member, setSelectedMember }) {
	function handleClose() {
		setSelectedMember(null);
	}
	console.log(member);
	return (
		<div
			className='bg-gray-400 absolute w-[60%]  h-[60vh] rounded-3xl z-10 flex flex-col p-3'
			style={{ backgroundColor: 'rgba(77,81,87,0.75)' }}>
			<button
				onClick={handleClose}
				className='absolute top-7 right-12 w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-700 active:bg-red-800 transition cursor-pointer'>
				x
			</button>
			<div className='flex justify-between w-full h-full'>
				<div className='flex flex-col justify-center h-full items-center w-[30%] text-text'>
					<img
						className='w-48  object-cover rounded-3xl mb-5'
						src={member.imageUrl}
					/>
					<p className='font-bold'>
						{member.name} | {member.party[0]}
					</p>
					<p className='text-sm'>
						{member.chamber} | {member.state}
					</p>
				</div>
				<div className='h-[90%] w-[60%] gap-4 flex flex-col overflow-y-auto mt-5 scrollbar text-text'>
					{member.trades
						.slice()
						.sort(
							(a, b) =>
								new Date(b.trade_date) - new Date(a.trade_date)
						)
						.map((trade) => (
							<div
								className={`grid grid-cols-3 mr-24 px-6 text-center rounded-full ${
									trade.action === 'b'
										? 'bg-green-800'
										: 'bg-red-700'
								}`}
								key={trade.trade_id}>
								<p className='col-span-1'>
									{trade.stock_ticker}
								</p>
								<p className='col-span-1'>
									~${Number(trade.amount).toLocaleString()}
								</p>
								<p className='col-span-1'>
									{formatDate(trade.trade_date)}
								</p>
							</div>
						))}
				</div>
			</div>
		</div>
	);
}
