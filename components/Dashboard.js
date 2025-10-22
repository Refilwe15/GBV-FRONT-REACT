import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import * as Location from "expo-location";

export default function Dashboard({ navigation }) {
  const features = [
    { id: 1, title: "Report Incident", icon: "pencil-square-o", color: "#8B5CF6", screen: "Report" },
    { id: 2, title: "My Reports", icon: "clipboard", color: "#6366F1", screen: "Reports" },
    { id: 3, title: "View Hotspot Map", icon: "map-marker", color: "#3B82F6", screen: "Map" },
    { id: 4, title: "Resources", icon: "cogs", color: "#0EA5E9", screen: "Resources" },
    { id: 5, title: "Community Chat", icon: "comments", color: "#8a2be2", screen: "CommunityChat" },
  ];

  // Navigate to community chat after detecting location
  const navigateToCommunity = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(" Permission Denied", "Enable location to join your community.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Simulate fetching community from backend using location
      // Replace with your actual API call
      const response = await fetch(
        `https://your-backend.com/community?lat=${latitude}&lng=${longitude}`,
        { method: "GET" }
      );

      if (!response.ok) throw new Error("Failed to fetch community");

      const community = await response.json();

      if (!community) {
        Alert.alert("No community found nearby.");
        return;
      }

      // Navigate to the CommunityChat screen
      navigation.navigate("CommunityChat", { communityId: community.id });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not determine your community.");
    }
  };

  const handleFeaturePress = (item) => {
    if (item.screen === "CommunityChat") {
      navigateToCommunity();
    } else {
      navigation.navigate(item.screen);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Dashboard</Text>

      {/* Decorative Stop Icon */}
      <View style={styles.stopWrapper}>
        <View style={styles.stopShape}>
          <Icon name="exclamation" size={40} color="#fff" />
        </View>
      </View>

      {/* Feature List */}
      <ScrollView contentContainerStyle={styles.list}>
        {features.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            style={[styles.card, { borderLeftColor: item.color }]}
            onPress={() => handleFeaturePress(item)}
          >
            <View style={[styles.iconWrapper, { backgroundColor: item.color + "20" }]}>
              <Icon name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={styles.cardText}>{item.title}</Text>
            <Icon name="angle-right" size={20} color="#9CA3AF" style={{ marginLeft: "auto" }} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Logout Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.logoutButton}
        onPress={() => navigation.replace("Login")}
      >
        <Icon name="sign-out" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
    marginBottom: 10,
  },
  stopWrapper: {
    alignItems: "center",
    marginBottom: 30,
  },
  stopShape: {
    width: 100,
    height: 100,
    backgroundColor: "#EF4444",
    borderRadius: 20,
    transform: [{ rotate: "22.5deg" }],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#EF4444",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  list: {
    paddingBottom: 30,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 18,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  iconWrapper: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#EF4444",
    paddingVertical: 15,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    shadowColor: "#EF4444",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
