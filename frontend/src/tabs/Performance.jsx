import ThreeD from '../charts/ThreeD';

export default function Performance() {
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
		</div>
	);
}
