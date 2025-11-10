import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
console.log("💜 ReportDetails Purple Theme Loaded");

const PURPLE = "#8B5CF6";
const LIGHT_PURPLE = "#F3E8FF";
const DARK_PURPLE = "#6D28D9";
const STATUS_COLORS = {
  Pending: "#F59E0B", // Amber
  "In Progress": "#3B82F6", // Blue
  Resolved: "#10B981", // Green
  Rejected: "#EF4444", // Red
};

export default function ReportDetails({ route, navigation }) {
  const defaultReport = {
    location: "Park Ave & 57th St, New York",
    description:
      "Loud noise complaint and public disturbance near the fountain.",
    anonymous: false,
    reporter_email: "jane.doe@example.com",
    created_at: new Date().toISOString(),
    attachment:
      "https://placehold.co/400x300/8b5cf6/ffffff?text=Evidence+Image.png",
    status: "Pending",
  };

  const { report = defaultReport } = route.params || {};
  const [message, setMessage] = useState(null);

  const showMessage = (text, type = "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const openAttachment = () => {
    if (!report.attachment) return;
    Linking.openURL(report.attachment).catch(() => {
      showMessage(
        "Unable to open attachment. Check your link or try again.",
        "error"
      );
    });
  };

  const renderField = (icon, label, value, highlight) => (
    <View
      style={[
        styles.card,
        highlight && {
          borderColor: STATUS_COLORS[value] || PURPLE,
          borderWidth: 1.5,
        },
      ]}
    >
      <View style={styles.labelRow}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text
        style={[
          styles.value,
          highlight && {
            color: STATUS_COLORS[value] || PURPLE,
            fontWeight: "700",
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );

  const NonBlockingMessageBox = () => {
    if (!message) return null;

    const isError = message.type === "error";
    const iconName = isError ? "alert-triangle" : "check-circle";
    const backgroundColor = isError ? "#EF4444" : "#10B981";

    return (
      <View style={[styles.nonBlockingMessageBox, { backgroundColor }]}>
        <Feather
          name={iconName}
          size={20}
          color="#fff"
          style={styles.messageIcon}
        />
        <Text style={styles.messageText}>{message.text}</Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <NonBlockingMessageBox />

      <TouchableOpacity
        style={styles.backRow}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={DARK_PURPLE} />
        <Text style={styles.backText}>Back to Reports</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Report Details</Text>

      {renderField(
        <Ionicons name="location-outline" size={20} color={PURPLE} />,
        "Location",
        report.location
      )}
      {renderField(
        <Feather name="file-text" size={20} color={PURPLE} />,
        "Description",
        report.description
      )}
      {renderField(
        <Feather name="flag" size={20} color={PURPLE} />,
        "Status",
        report.status,
        true
      )}
      {renderField(
        <Feather name="user-x" size={20} color={PURPLE} />,
        "Anonymous Submission",
        report.anonymous ? "Yes, the reporter is anonymous." : "No"
      )}
      {!report.anonymous &&
        renderField(
          <Feather name="mail" size={20} color={PURPLE} />,
          "Reporter Email",
          report.reporter_email
        )}
      {renderField(
        <Feather name="calendar" size={20} color={PURPLE} />,
        "Reported On",
        `${new Date(report.created_at).toLocaleDateString()} at ${new Date(
          report.created_at
        ).toLocaleTimeString()}`
      )}

      {report.attachment && (
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <MaterialCommunityIcons
              name="paperclip"
              size={20}
              color={PURPLE}
            />
            <Text style={styles.label}>Attachment</Text>
          </View>
          <TouchableOpacity
            style={styles.attachmentCard}
            onPress={openAttachment}
            activeOpacity={0.8}
          >
            {/\.(jpg|jpeg|png|gif)$/i.test(report.attachment) ? (
              <Image
                source={{ uri: report.attachment }}
                style={styles.attachmentImage}
              />
            ) : (
              <View style={styles.attachmentFile}>
                <Feather name="file" size={22} color={PURPLE} />
                <Text style={styles.attachmentText}>
                  {report.attachment.split("/").pop() || "File Attachment"}
                </Text>
              </View>
            )}
            <Text style={styles.openText}>Tap to open attachment</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_PURPLE, // 💜 Soft lavender background
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: DARK_PURPLE,
  },
  header: {
    fontSize: 32,
    fontWeight: "800",
    color: DARK_PURPLE,
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E9D5FF",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: DARK_PURPLE,
    marginLeft: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: "#4B5563",
    backgroundColor: "#F5F3FF",
    padding: 12,
    borderRadius: 10,
    lineHeight: 22,
  },
  attachmentCard: {
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    marginTop: 10,
  },
  attachmentImage: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    marginBottom: 8,
    resizeMode: "cover",
  },
  attachmentFile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  attachmentText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "600",
    color: PURPLE,
  },
  openText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    fontStyle: "italic",
  },
  nonBlockingMessageBox: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
  },
  messageIcon: {
    marginRight: 10,
  },
  messageText: {
    color: "#fff",
    fontWeight: "600",
    flexShrink: 1,
    fontSize: 15,
  },
});
