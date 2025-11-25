import MapStory from '../charts/map';

export default function Who({ data }) {
	// TODO grab more data from postgres and create a second csv about congressmembers specifically
	// TODO display each MOC (if they have trades). Merge into total amount traded in django as well
	return (
		<div className='w-full flex flex-col items-center'>
			<MapStory data={data} />
		</div>
	);
}
