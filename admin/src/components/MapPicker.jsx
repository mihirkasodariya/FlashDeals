import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    // Fly to position if it changes initially, to ensure it's centered
    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom(), { animate: false });
        }
    }, []);

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

const MapPicker = ({ location, onLocationChange, height = '250px' }) => {
    // Default to Surat if no location provided
    const defaultCenter = { lat: 21.2357823, lng: 72.8243819 };
    
    // Initialize with provided location or default
    const [position, setPosition] = useState(
        location?.latitude && location?.longitude
            ? { lat: location.latitude, lng: location.longitude }
            : defaultCenter
    );

    // Sync if props change significantly (e.g. modal opens with new vendor)
    useEffect(() => {
        if (location?.latitude && location?.longitude) {
            setPosition({ lat: location.latitude, lng: location.longitude });
        } else {
             setPosition(defaultCenter);
        }
    }, [location?.latitude, location?.longitude]);

    const handlePositionChange = (newPos) => {
        setPosition(newPos);
        onLocationChange({ latitude: newPos.lat, longitude: newPos.lng });
    };

    return (
        <div style={{ height: height, width: '100%', borderRadius: '14px', overflow: 'hidden', border: '1.5px solid #e2e8f0', position: 'relative', zIndex: 1 }}>
            <MapContainer 
                center={position} 
                zoom={14} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%', zIndex: 1 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={handlePositionChange} />
            </MapContainer>
        </div>
    );
};

export default MapPicker;
