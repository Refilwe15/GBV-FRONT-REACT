import React, { useEffect, useState } from "react";
import "./Reports.css";
import ENV from "../.env";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const email = await AsyncStorage.getItem("email");
        if (!email) {
          console.warn("No email found in AsyncStorage");
          setReports([]);
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${ENV.BACKEND_URL}/incidents/?reporter_email=${encodeURIComponent(
            email
          )}`
        );
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <p>Loading your reports...</p>;
  }

  return (
    <div className="reports-page">
      <h1 className="reports-header">My Reports</h1>

      {reports.length === 0 ? (
        <p className="no-reports">You have not submitted any reports yet.</p>
      ) : (
        <div className="reports-grid">
          {reports.map((report) => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <h2 className="report-location">{report.location}</h2>
                <span className="report-date">
                  {new Date(report.created_at).toLocaleString()}
                </span>
              </div>
              <p className="report-description">{report.description}</p>
              <p className="report-description">status: {report.status}</p>
              {report.attachment && (
                <a
                  href={report.attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="report-attachment"
                >
                  View Attachment
                </a>
              )}
              {report.anonymous && (
                <span className="report-anonymous">Anonymous</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
