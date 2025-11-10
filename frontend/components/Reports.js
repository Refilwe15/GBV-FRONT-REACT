import React, { useEffect, useState } from "react";
import ENV from "../.env";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Reusable modal component
const MessageBox = ({ visible, type, message, onClose }) => {
  if (!visible) return null;

  const colors = {
    success: "#10B981",
    error: "#EF4444",
    info: "#3B82F6",
  };

  const icons = {
    success: "✔️",
    error: "❌",
    info: "ℹ️",
  };

  const color = colors[type] || "#3B82F6";
  const icon = icons[type] || "ℹ️";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: "25px 30px",
          textAlign: "center",
          minWidth: "300px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 48, marginBottom: 15, color: color }}>
          {icon}
        </div>
        <p style={{ marginBottom: 20 }}>{message}</p>
        <button
          onClick={onClose}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            backgroundColor: color,
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("info");
  const [modalMessage, setModalMessage] = useState("");

  const showMessage = (type, message) => {
    setModalType(type);
    setModalMessage(message);
    setModalVisible(true);
  };

  const fetchReports = async () => {
    setLoading(true);

    try {
      const email = await AsyncStorage.getItem("email");

      if (!email) {
        showMessage("error", "You are not logged in. Please log in to view your reports.");
        setReports([]);
        setLoading(false);
        return;
      }

      const res = await fetch(
        `${ENV.BACKEND_URL}/incidents/?reporter_email=${encodeURIComponent(email)}`
      );

      if (!res.ok) {
        throw new Error(`Server error (${res.status})`);
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response format from the server.");
      }

      setReports(data);

      if (data.length === 0) {
        showMessage("info", "You have not submitted any reports yet.");
      } else {
        showMessage("success", "Reports loaded successfully!");
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      showMessage(
        "error",
        "Failed to load reports. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getStatusStyle = (status) => {
    const base = {
      display: "inline-block",
      padding: "6px 14px",
      borderRadius: "9999px",
      fontWeight: 700,
      fontSize: "0.85rem",
      marginLeft: "8px",
      letterSpacing: "0.3px",
    };

    switch (status?.toLowerCase()) {
      case "pending":
        return { ...base, background: "#fef9c3", color: "#92400e" };
      case "solved":
      case "resolved":
        return { ...base, background: "#dcfce7", color: "#065f46" };
      case "dismissed":
      case "rejected":
        return { ...base, background: "#fee2e2", color: "#991b1b" };
      case "in progress":
        return { ...base, background: "#dbeafe", color: "#1d4ed8" };
      default:
        return { ...base, background: "#e0e7ff", color: "#3730a3" };
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <h1 style={styles.header}>My Reports</h1>
        <p style={styles.noReports}>Loading your reports...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.header}>My Reports</h1>

      {/* ✅ Modal */}
      <MessageBox
        visible={modalVisible}
        type={modalType}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />

      {reports.length === 0 ? (
        <p style={styles.noReports}>You have not submitted any reports yet.</p>
      ) : (
        <div style={styles.grid}>
          {reports.map((report) => (
            <div key={report.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.location}>{report.location}</h2>
                <span style={styles.date}>
                  {new Date(report.created_at).toLocaleString()}
                </span>
              </div>

              {/* Description with label */}
              <div style={styles.row}>
                <span style={styles.label}>Description:</span>
                <p style={styles.description}>{report.description}</p>
              </div>

              {/* Status with label */}
              <div style={styles.row}>
                <span style={styles.label}>Status:</span>
                <span style={getStatusStyle(report.status)}>
                  {report.status}
                </span>
              </div>

              {report.attachment && (
                <a
                  href={report.attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.attachment}
                >
                  View Attachment
                </a>
              )}

              {report.anonymous && <span style={styles.anonymous}>Anonymous</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* 🎨 Internal Styles */
const styles = {
  page: {
    fontFamily: "'Inter', sans-serif",
    background: "linear-gradient(180deg, #f5f3ff 0%, #faf5ff 100%)",
    minHeight: "100vh",
    padding: "50px 30px",
    color: "#3f3f46",
  },
  header: {
    color: "#5b21b6",
    textAlign: "center",
    fontSize: "2.3rem",
    fontWeight: 800,
    marginBottom: "45px",
    letterSpacing: "-0.5px",
  },
  noReports: {
    textAlign: "center",
    fontSize: "1.1rem",
    color: "#6b21a8",
    fontWeight: 500,
    background: "#f3e8ff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 1px 6px rgba(124, 58, 237, 0.1)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "28px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e9d5ff",
    boxShadow: "0 3px 8px rgba(91, 33, 182, 0.08)",
    transition: "all 0.25s ease",
    padding: "22px 24px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "10px",
  },
  location: {
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#6d28d9",
    textTransform: "capitalize",
  },
  date: {
    fontSize: "0.9rem",
    color: "#6b7280",
  },
  row: {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
  },
  label: {
    fontWeight: 700,
    color: "#5b21b6",
    marginRight: "8px",
    fontSize: "0.95rem",
    minWidth: "90px",
  },
  description: {
    color: "#444",
    fontSize: "0.95rem",
    lineHeight: 1.5,
  },
  attachment: {
    display: "inline-block",
    marginTop: "10px",
    color: "#5b21b6",
    textDecoration: "none",
    fontWeight: 600,
    background: "#ede9fe",
    padding: "8px 14px",
    borderRadius: "6px",
    transition: "0.2s",
  },
  anonymous: {
    display: "inline-block",
    marginTop: "10px",
    background: "#a78bfa",
    color: "white",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: 600,
  },
};
