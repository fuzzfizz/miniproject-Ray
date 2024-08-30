"use client";
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap is imported

const HomePage = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [ledStatus, setLedStatus] = useState(null); // State for LED status

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/get");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result);
        console.log(result);
      } catch (error) {
        setError(error);
      }
    };

    const fetchLedStatus = async () => {
      try {
        const response = await fetch("/api/iot");
        if (!response.ok) {
          throw new Error("Failed to fetch LED status");
        }
        const ledData = await response.json();
        setLedStatus(ledData.LED_Status); // Update to use LED_Status from response
      } catch (error) {
        console.error("Error fetching LED status:", error);
        setError(error);
      }
    };

    fetchData();
    fetchLedStatus();

    const intervalId = setInterval(() => {
      fetchData();
      fetchLedStatus();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const handleUpdate = async (id, value) => {
    try {
      const response = await fetch("/api/iot", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ LED_Status: value }),
      });

      if (!response.ok) {
        throw new Error("Failed to update data");
      }

      setLedStatus(value);
    } catch (error) {
      console.error("Error updating data:", error);
      setError(error);
    }
  };

  if (error) {
    return <div className="alert alert-danger">Error: {error.message}</div>;
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4 text-center">Sensor Dashboard</h1>
      <div className="row">
        <div className="col-md-4 mb-4 d-flex">
          {/* Card for Ultrasonic & LED Ultrasonic */}
          <div className="card flex-fill" style={{ backgroundColor: '#ffcc00', color: '#000' }}>
            <div className="card-body d-flex flex-column">
              <h5 className="card-title border border-dark p-2 rounded">SANG & LED SANG</h5>
              <p className="card-text">
                <strong>SANG:</strong> {data[0]?.SANG || 'Loading...'} cm
              </p>
              <p className="card-text">
                <strong>LED SANG:</strong> {data[0]?.SANG_LED || 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4 d-flex">
          {/* Card for LDR & LED LDR Pin */}
          <div className="card flex-fill" style={{ backgroundColor: '#ffcc00', color: '#000' }}>
            <div className="card-body d-flex flex-column">
              <h5 className="card-title border border-dark p-2 rounded">UNP & LED UNP</h5>
              <p className="card-text">
                <strong>UNP:</strong> {data[0]?.UNP || 'Loading...'}
              </p>
              <p className="card-text">
                <strong>LED UNP:</strong> {data[0]?.UNP_LED || 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4 d-flex">
          {/* Card for LED Status & Controls */}
          <div className="card flex-fill" style={{ backgroundColor: '#ffcc00', color: '#000' }}>
            <div className="card-body d-flex flex-column">
              <h5 className="card-title border border-dark p-2 rounded">LED Status & Controls</h5>
              <p className="card-text">
                <strong>LED Status:</strong>{" "}
                {ledStatus !== null ? ledStatus : "Loading..."}
              </p>
              <div className="d-flex gap-3 mt-auto">
                <button
                  className="btn btn-primary"
                  onClick={() => handleUpdate(data[0]?.id, 0)}
                >
                  Set LED Status to 0
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => handleUpdate(data[0]?.id, 1)}
                >
                  Set LED Status to 1
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;