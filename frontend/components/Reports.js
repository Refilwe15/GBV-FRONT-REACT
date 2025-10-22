import React, { useEffect, useState } from "react";
import "./Reports.css";
import ENV from "../.env";

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(
          `${ENV.BACKEND_URL}/incidents/?reporter_email=user@example.com`
        );
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      }
    };
    fetchReports();
  }, []);

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
