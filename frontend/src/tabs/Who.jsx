import MapStory from '../charts/map';

export default function Who({ setBlurred, data }) {
	return (
		<div className='w-full flex flex-col items-center'>
			<MapStory setBlurred={setBlurred} data={data} />
		</div>
	);
}
