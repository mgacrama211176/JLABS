import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHistory, deleteHistory } from "../redux/slices/historySlice";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
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
  const auth = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchHistory());
    (async () => {
      await fetchCurrentGeo();
    })();
  }, [dispatch]);

  // Function to fetch the user's IP address
  const fetchIpAddress = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error fetching IP address:", error);
    }
  };

  const fetchCurrentGeo = async () => {
    setIsLoading(true);
    const ipAddress = await fetchIpAddress();

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/ip/current`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ip: ipAddress,
          },
        }
      );
      if (response.data && response.data.geoData) {
        setCurrentGeo(response.data.geoData);
      } else {
        console.error("Missing location data in response");
      }
    } catch (err) {
      console.error("Error fetching geo data:", err);
    } finally {
      setIsLoading(false);
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
    console.log("Current Geo Data:", currentGeo);
    if (currentGeo?.loc) {
      const coords = currentGeo.loc
        .split(",")
        .map((coord) => parseFloat(coord));
      console.log("Parsed Coordinates:", coords);
      if (coords.length === 2 && coords.every((num) => !isNaN(num))) {
        return coords;
      }
    }
    return null;
  };

  const coordinates = getCoordinates();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Dashboard</h2>

        {/* IP Lookup Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-2xl font-medium text-gray-700 mb-4">IP Lookup</h3>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="text"
              placeholder="Enter IP Address"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              className="w-full sm:w-auto flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleLookup}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={auth.loading}
            >
              {auth.loading ? "Looking up..." : "Lookup"}
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        {/* Current IP Information */}
        {isLoading ? (
          <p>Loading current location...</p>
        ) : (
          currentGeo && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-2xl font-medium text-gray-700 mb-4">
                Current IP Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">
                    <strong>IP:</strong> {currentGeo.ip}
                  </p>
                  <p className="text-gray-600">
                    <strong>City:</strong> {currentGeo.city}
                  </p>
                  <p className="text-gray-600">
                    <strong>Region:</strong> {currentGeo.region}
                  </p>
                  <p className="text-gray-600">
                    <strong>Country:</strong> {currentGeo.country}
                  </p>
                  <p className="text-gray-600">
                    <strong>Location:</strong> {currentGeo.loc}
                  </p>
                </div>
                {/* Optional: Display Map */}
                <div className="mt-4 md:mt-0">
                  {coordinates ? (
                    <MapContainer
                      center={coordinates}
                      zoom={13}
                      style={{ height: "300px", width: "100%" }}
                      className="rounded-lg"
                    >
                      <TileLayer
                        url={`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`}
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={coordinates}>
                        <Popup>
                          {currentGeo.city}, {currentGeo.region},{" "}
                          {currentGeo.country}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <p className="text-red-500">No location data available.</p>
                  )}
                </div>
              </div>
            </div>
          )
        )}

        {/* Search History Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-medium text-gray-700">
              Search History
            </h3>
            {selectedIds.length > 0 && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Selected
              </button>
            )}
          </div>
          {history.loading ? (
            <p>Loading history...</p>
          ) : history.error ? (
            <p className="text-red-500">{history.error}</p>
          ) : history.items.length === 0 ? (
            <p className="text-gray-500">No history available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b">Select</th>
                    <th className="px-4 py-2 border-b">IP</th>
                    <th className="px-4 py-2 border-b">City</th>
                    <th className="px-4 py-2 border-b">Region</th>
                    <th className="px-4 py-2 border-b">Country</th>
                    <th className="px-4 py-2 border-b">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {history.items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-100 cursor-pointer"
                      onClick={() => setCurrentGeo(item.geoData)}
                    >
                      <td className="px-4 py-2 border-b text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleCheckboxChange(item.id);
                          }}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                      </td>
                      <td className="px-4 py-2 border-b">{item.ip}</td>
                      <td className="px-4 py-2 border-b">
                        {item.geoData.city}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {item.geoData.region}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {item.geoData.country}
                      </td>
                      <td className="px-4 py-2 border-b">{item.geoData.loc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
