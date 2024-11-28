import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHistory, deleteHistory } from "../redux/slices/historySlice";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix the default icon issue with Leaflet in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

function Home() {
  const dispatch = useDispatch();
  const history = useSelector((state) => state.history);
  const token = useSelector((state) => state.auth.token);
  const [currentGeo, setCurrentGeo] = useState(null);
  const [ipInput, setIpInput] = useState("");
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    dispatch(fetchHistory());
    fetchCurrentGeo();
  }, [dispatch]);

  const fetchCurrentGeo = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/ip/current`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(`response.data:`, response.data);
      setCurrentGeo(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLookup = async () => {
    setError("");
    // Validate IP
    const ipRegex =
      /^(25[0-5]|2[0-4]\d|[0-1]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[0-1]?\d{1,2})){3}$/;
    if (!ipRegex.test(ipInput)) {
      setError("Invalid IP address.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/ip/lookup`,
        { ip: ipInput },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCurrentGeo(response.data);
      dispatch(fetchHistory());
      setIpInput("");
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching data.");
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    dispatch(deleteHistory(selectedIds));
    setSelectedIds([]);
  };

  // Extract coordinates if loc is defined and properly formatted
  const getCoordinates = () => {
    if (currentGeo?.loc) {
      const coords = currentGeo.loc
        .split(",")
        .map((coord) => parseFloat(coord));
      if (coords.length === 2 && coords.every((num) => !isNaN(num))) {
        return coords;
      }
    }
    return null;
  };

  const coordinates = getCoordinates();

  return (
    <div className="home-container">
      <h2>Home</h2>
      {currentGeo && (
        <div className="geo-info">
          <h3>Current IP Information</h3>
          <p>
            <strong>IP:</strong> {currentGeo?.ip}
          </p>
          <p>
            <strong>City:</strong> {currentGeo?.city}
          </p>
          <p>
            <strong>Region:</strong> {currentGeo?.region}
          </p>
          <p>
            <strong>Country:</strong> {currentGeo?.country}
          </p>
          <p>
            <strong>Location:</strong> {currentGeo?.loc}
          </p>
          {/* Optional: Display Map */}
          {coordinates ? (
            <MapContainer
              center={coordinates}
              zoom={13}
              style={{ height: "300px", width: "100%" }}
            >
              <TileLayer
                url={`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={coordinates}>
                <Popup>
                  {currentGeo?.city}, {currentGeo?.region},{" "}
                  {currentGeo?.country}
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <p>No location data available.</p>
          )}
        </div>
      )}
      <div className="lookup-section">
        <input
          type="text"
          placeholder="Enter IP Address"
          value={ipInput}
          onChange={(e) => setIpInput(e.target.value)}
        />
        <button onClick={handleLookup}>Lookup</button>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="history-section">
        <h3>Search History</h3>
        {history.loading ? (
          <p>Loading history...</p>
        ) : history.error ? (
          <p className="error">{history.error}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Select</th>
                <th>IP</th>
                <th>City</th>
                <th>Region</th>
                <th>Country</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {history.items.map((item) => (
                <tr key={item.id} onClick={() => setCurrentGeo(item.geoData)}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleCheckboxChange(item.id);
                      }}
                    />
                  </td>
                  <td>{item.ip}</td>
                  <td>{item.geoData.city}</td>
                  <td>{item.geoData.region}</td>
                  <td>{item.geoData.country}</td>
                  <td>{item.geoData.loc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {selectedIds.length > 0 && (
          <button onClick={handleDelete}>Delete Selected</button>
        )}
      </div>
    </div>
  );
}

export default Home;
