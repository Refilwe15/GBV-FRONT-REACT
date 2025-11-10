import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons"; // Chatbot icon

export default function Dashboard({ navigation }) {
  const features = [
    {
      id: 1,
      title: "Report Incident",
      icon: "pencil-square-o",
      color: "#A855F7",
      screen: "Report",
    },
    {
      id: 2,
      title: "My Reports",
      icon: "clipboard",
      color: "#8B5CF6",
      screen: "Reports",
    },
    {
      id: 3,
      title: "View Hotspot Map",
      icon: "map-marker",
      color: "#7C3AED",
      screen: "ReportsMap",
    },
    {
      id: 4,
      title: "ContactSetUp",
      icon: "cogs",
      color: "#9333EA",
      screen: "ContactSetUp",
    },
    {
      id: 5,
      title: "Community Chat",
      icon: "comments",
      color: "#6D28D9",
      screen: "CommunityChat",
    },
  ];

  const handleFeaturePress = (item) => {
    navigation.navigate(item.screen);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerWrapper}>
        <Text style={styles.header}>Dashboard</Text>
      </View>

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
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: item.color + "20" },
              ]}
            >
              <Icon name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={styles.cardText}>{item.title}</Text>
            <Icon
              name="angle-right"
              size={20}
              color="#9CA3AF"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Logout Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.logoutButton}
        onPress={() => navigation.replace("Login")}
      >
        <Icon
          name="sign-out"
          size={18}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* 💬 Chatbot Floating Icon */}
      <TouchableOpacity
        style={styles.chatbotButton}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("ChatbotScreen")}
      >
        <Ionicons name="chatbubbles" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3E8FF", // 💜 light lavender background
    padding: 20,
    paddingTop: 50,
  },
  headerWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  header: {
    fontSize: 30,
    fontWeight: "800",
    color: "#4C1D95", // 💜 deep purple text
  },
  chatbotButton: {
    position: "absolute",
    bottom: 90,
    right: 20,
    backgroundColor: "#7C3AED", // 💜 purple floating button
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
  },
  stopWrapper: {
    alignItems: "center",
    marginBottom: 30,
  },
  stopShape: {
    width: 100,
    height: 100,
    backgroundColor: "#C084FC", // 💜 soft purple stop icon
    borderRadius: 20,
    transform: [{ rotate: "22.5deg" }],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#C084FC",
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
    color: "#4C1D95", // 💜 deep purple for feature titles
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#9333EA", // 💜 purple logout button
    paddingVertical: 15,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    shadowColor: "#9333EA",
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
