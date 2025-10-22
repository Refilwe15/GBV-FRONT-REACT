import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function ReportsMap() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("http://backend:8000/incidents/");
        const data = await res.json();

        // Extract locations and convert them to coordinates
        // For simplicity, we assume backend returns latitude & longitude or you can use a simple geocoding function
        const coords = data
          .filter((r) => r.latitude && r.longitude)
          .map((r) => ({
            id: r.id,
            location: r.location,
            lat: r.latitude,
            lng: r.longitude,
          }));
        setLocations(coords);
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    };

    fetchReports();
  }, []);

  const center = locations.length
    ? [locations[0].lat, locations[0].lng]
    : [-25.746111, 28.188056];

  return (
    <div style={{ height: "80vh", width: "100%", marginTop: 20 }}>
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup>{loc.location}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
