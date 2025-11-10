import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;
const BASE_URL = "http://10.220.32.224:8000"; // backend URL

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [userModal, setUserModal] = useState(false);
  const [incidentModal, setIncidentModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState("incidents"); // "incidents" or "users"

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incRes, userRes] = await Promise.all([
        fetch(`${BASE_URL}/incidents/classified-incidents`),
        fetch(`${BASE_URL}/active`),
      ]);
      const incidentsData = await incRes.json();
      const usersData = await userRes.json();
      setIncidents(incidentsData);
      setUsers(usersData);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const categoryCounts = incidents.reduce((acc, i) => {
    acc[i.predicted_category] = (acc[i.predicted_category] || 0) + 1;
    return acc;
  }, {});
  const chartData = {
    labels: Object.keys(categoryCounts),
    datasets: [{ data: Object.values(categoryCounts) }],
  };

  // --- Handlers ---
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserModal(true);
  };

  const handleSaveUser = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedUser),
      });
      if (!res.ok) throw new Error("Failed to update user");
      setUserModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateIncidentStatus = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/incidents/${selectedIncident.id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            status: selectedIncident.status,
          }).toString(),
        }
      );
      if (!res.ok) throw new Error("Failed to update incident");
      setIncidentModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text>Loading dashboard...</Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      {/* Sidebar */}
      <View
        style={[styles.sidebar, sidebarOpen ? {} : styles.sidebarCollapsed]}
      >
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setSidebarOpen(!sidebarOpen)}
        >
          <Icon
            name={sidebarOpen ? "arrow-left" : "arrow-right"}
            size={18}
            color="#fff"
          />
        </TouchableOpacity>
        {sidebarOpen && (
          <>
            <TouchableOpacity
              style={[
                styles.sidebarItem,
                view === "incidents" && styles.activeItem,
              ]}
              onPress={() => setView("incidents")}
            >
              <Icon name="exclamation-triangle" size={18} color="#fff" />
              <Text style={styles.sidebarText}>Incidents</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sidebarItem,
                view === "users" && styles.activeItem,
              ]}
              onPress={() => setView("users")}
            >
              <Icon name="users" size={18} color="#fff" />
              <Text style={styles.sidebarText}>Users</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.header}>Admin Dashboard</Text>

        {/* INCIDENTS VIEW */}
        {view === "incidents" && (
          <>
            {/* Chart */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Incident Categories</Text>
              {Object.keys(categoryCounts).length > 0 ? (
                <BarChart
                  data={chartData}
                  width={screenWidth - (sidebarOpen ? 160 : 60)}
                  height={220}
                  fromZero
                  chartConfig={{
                    backgroundGradientFrom: "#fff",
                    backgroundGradientTo: "#fff",
                    color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                    barPercentage: 0.6,
                  }}
                  style={{ borderRadius: 10 }}
                />
              ) : (
                <Text style={{ textAlign: "center", color: "#6B7280" }}>
                  No incidents yet
                </Text>
              )}
            </View>

            {/* Incidents List */}
            {incidents.map((inc) => (
              <View key={inc.id} style={styles.card}>
                <Text style={styles.cardTitle}>{inc.predicted_category}</Text>
                <Text style={styles.description}>{inc.description}</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Location:</Text>
                  <Text style={styles.infoValue}>{inc.location}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Reporter:</Text>
                  <Text style={styles.infoValue}>{inc.reporter_email}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status:</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      statusColors[inc.status?.toLowerCase()] ||
                        statusColors.default,
                    ]}
                  >
                    <Text style={styles.statusText}>{inc.status}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#7C3AED" }]}
                  onPress={() => {
                    setSelectedIncident(inc);
                    setIncidentModal(true);
                  }}
                >
                  <Text style={styles.buttonText}>Update Status</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* USERS VIEW */}
        {view === "users" &&
          users.map((u) => (
            <View key={u.id} style={styles.card}>
              <Text style={styles.cardTitle}>{u.full_name}</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{u.email}</Text>
              </View>

              <View style={{ flexDirection: "row", marginTop: 10 }}>
                <TouchableOpacity
                  onPress={() => handleEditUser(u)}
                  style={styles.userBtn}
                >
                  <Icon name="edit" size={16} color="#A78BFA" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      await fetch(`${BASE_URL}/users/${u.id}`, {
                        method: "DELETE",
                      });
                      fetchData();
                    } catch (err) {
                      alert(err.message);
                    }
                  }}
                  style={[styles.userBtn, { marginLeft: 10 }]}
                >
                  <Icon name="trash" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

        {/* EDIT USER MODAL */}
        <Modal visible={userModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Edit User</Text>
              <TextInput
                style={styles.input}
                value={selectedUser?.full_name}
                onChangeText={(text) =>
                  setSelectedUser({ ...selectedUser, full_name: text })
                }
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleSaveUser}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#EF4444" }]}
                  onPress={() => setUserModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* UPDATE INCIDENT MODAL */}
        <Modal visible={incidentModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Update Incident Status</Text>
              <TextInput
                style={styles.input}
                value={selectedIncident?.status}
                onChangeText={(text) =>
                  setSelectedIncident({ ...selectedIncident, status: text })
                }
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleUpdateIncidentStatus}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#EF4444" }]}
                  onPress={() => setIncidentModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles ---
const statusColors = {
  pending: { backgroundColor: "#FBBF24" },
  "in progress": { backgroundColor: "#3B82F6" },
  resolved: { backgroundColor: "#10B981" },
  dismissed: { backgroundColor: "#EF4444" },
  default: { backgroundColor: "#A78BFA" },
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", backgroundColor: "#F3F4F6" },
  sidebar: {
    width: 160,
    backgroundColor: "#7C3AED",
    paddingTop: 40,
    paddingHorizontal: 10,
  },
  sidebarCollapsed: { width: 60 },
  toggleBtn: {
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  activeItem: { backgroundColor: "#A78BFA", borderRadius: 6 },
  sidebarText: { color: "#fff", fontSize: 16, marginLeft: 10 },
  content: { flex: 1, padding: 10 },
  header: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 5 },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: { fontWeight: "700", marginBottom: 6, fontSize: 16, color: "#6B21A8" },
  description: { marginBottom: 8, fontSize: 14, color: "#4B5563", lineHeight: 18 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  infoLabel: { fontWeight: "600", color: "#6B21A8", fontSize: 14 },
  infoValue: { color: "#374151", fontSize: 14, flexShrink: 1, textAlign: "right" },
  statusBadge: { borderRadius: 12, paddingVertical: 2, paddingHorizontal: 10, minWidth: 80, alignItems: "center" },
  statusText: { color: "#fff", fontWeight: "600", fontSize: 13, textTransform: "capitalize" },
  button: {
    marginTop: 8,
    backgroundColor: "#7C3AED",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  modalBox: { backgroundColor: "#fff", margin: 20, padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 6, padding: 8, marginBottom: 10 },
  modalButton: { flex: 1, backgroundColor: "#7C3AED", padding: 10, borderRadius: 6, alignItems: "center", marginRight: 5 },
  modalButtonText: { color: "#fff", fontWeight: "600" },
  userBtn: { padding: 6, borderRadius: 5, backgroundColor: "#EDE9FE", alignItems: "center" },
});
