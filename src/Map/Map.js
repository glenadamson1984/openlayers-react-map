import React, { useRef, useState, useEffect } from "react"
import "./Map.css";
import MapContext from "./MapContext";
import * as ol from "ol";
import {transform} from "ol/proj";

const Map = ({ children, zoom, center, updateCord }) => {

	const [map, setMap] = useState(null);
	const [ selectedCoord , setSelectedCoord ] = useState();
	const [ allselectCoord, setAllSelectedCoord] = useState([]);

	const mapRef = useRef()
	mapRef.current = map;

	// on component mount
	useEffect(() => {
		let options = {
			view: new ol.View({ zoom, center }),
			layers: [],
			controls: [],
			overlays: []
		};

		let mapObject = new ol.Map(options);
		mapObject.setTarget(mapRef.current);

		mapObject.on('click', handleMapClick)


		setMap(mapObject);

		return () => mapObject.setTarget(undefined);
	}, []);

	// zoom change handler
	useEffect(() => {
		if (!map) return;

		map.getView().setZoom(zoom);
	}, [zoom]);

	// center change handler
	useEffect(() => {
		if (!map) return;

		map.getView().setCenter(center)
	}, [center])

	const handleMapClick = (event) => {
		// coordinateToPixelTransform_: (6) [0.0032706661366698306, 0, 0, -0.0032706661366698306, 2859.0789250620473, 24370.7184605737]
		// get clicked coordinate using mapRef to access current React state inside OpenLayers callback
		//  https://stackoverflow.com/a/60643670
		const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);
		// transform coord to EPSG 4326 standard Lat Long
		const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')
		// set React state
		setSelectedCoord( transormedCoord );
		setAllSelectedCoord((prevState => {
			return [...prevState, transormedCoord]
		}))
	}

	const handleSubmit = () => {
		updateCord(allselectCoord);
	}

	return (
		<MapContext.Provider value={{ map }}>
			<div  ref={mapRef} className="ol-map">
				{children}
			</div>
			<button onClick={handleSubmit}>Add to Json</button>
		</MapContext.Provider>
	)
}

export default Map;
