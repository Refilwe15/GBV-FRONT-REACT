import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ENV from "../.env";

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
  const [loading, setLoading] = useState(true);

  const geocodeLocation = async (address) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );
      const data = await res.json();
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }
    return null;
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${ENV.BACKEND_URL}/incidents/all-incidents`);
        const data = await res.json();

        const coordsPromises = data.map(async (report) => {
          const coords = await geocodeLocation(report.location);
          if (coords) {
            return {
              id: report.id,
              location: report.location,
              description: report.description,
              status: report.status,
              lat: coords.lat,
              lng: coords.lng,
            };
          }
          return null;
        });

        const coordsResults = await Promise.all(coordsPromises);
        setLocations(coordsResults.filter((r) => r !== null));
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const center = locations.length
    ? [locations[0].lat, locations[0].lng]
    : [-23.8958, 29.4673]; // Polokwane default

  if (loading) return <p>Loading map...</p>;

  return (
    <div style={{ height: "80vh", width: "100%", marginTop: 20 }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup>
              <strong>{loc.location}</strong>
              <br />
              {loc.description}
              <br />
              <em>Status: {loc.status}</em>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
