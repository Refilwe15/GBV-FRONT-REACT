import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function ReportDetails({ route, navigation }) {
  const { report } = route.params;

  const openAttachment = () => {
    if (!report.attachment) return;

    Linking.openURL(report.attachment).catch(() => {
      Alert.alert("Error", "Unable to open attachment.");
    });
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backRow}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={22} color="#333" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Report Details</Text>

      <View style={styles.labelRow}>
        <Ionicons name="location-outline" size={20} color="#8a2be2" />
        <Text style={styles.label}>Location</Text>
      </View>
      <Text style={styles.value}>{report.location}</Text>

      <View style={styles.labelRow}>
        <Feather name="file-text" size={20} color="#8a2be2" />
        <Text style={styles.label}>Description</Text>
      </View>
      <Text style={styles.value}>{report.description}</Text>

      <View style={styles.labelRow}>
        <Feather name="user-x" size={20} color="#8a2be2" />
        <Text style={styles.label}>Anonymous</Text>
      </View>
      <Text style={styles.value}>{report.anonymous ? "Yes" : "No"}</Text>

      {!report.anonymous && (
        <>
          <View style={styles.labelRow}>
            <Feather name="mail" size={20} color="#8a2be2" />
            <Text style={styles.label}>Reporter Email</Text>
          </View>
          <Text style={styles.value}>{report.reporter_email}</Text>
        </>
      )}

      {/* Created At */}
      <View style={styles.labelRow}>
        <Feather name="calendar" size={20} color="#8a2be2" />
        <Text style={styles.label}>Reported On</Text>
      </View>
      <Text style={styles.value}>
        {new Date(report.created_at).toLocaleDateString()}{" "}
        {new Date(report.created_at).toLocaleTimeString()}
      </Text>

      {/* Attachment */}
      {report.attachment && (
        <>
          <View style={styles.labelRow}>
            <MaterialCommunityIcons
              name="paperclip"
              size={20}
              color="#8a2be2"
            />
            <Text style={styles.label}>Attachment</Text>
          </View>
          <TouchableOpacity
            style={styles.attachmentCard}
            onPress={openAttachment}
          >
            {report.attachment.endsWith(".jpg") ||
            report.attachment.endsWith(".png") ||
            report.attachment.endsWith(".jpeg") ? (
              <Image
                source={{ uri: report.attachment }}
                style={styles.attachmentImage}
              />
            ) : (
              <View style={styles.attachmentFile}>
                <Feather name="file" size={22} color="#8a2be2" />
                <Text style={styles.attachmentText}>
                  {report.attachment.split("/").pop()}
                </Text>
              </View>
            )}
            <Text style={styles.openText}>Tap to open</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, paddingTop: 40 },
  backRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  backText: { marginLeft: 5, fontSize: 16, color: "#333" },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#8a2be2",
    marginBottom: 25,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    marginTop: 10,
  },
  label: { fontSize: 16, fontWeight: "600", color: "#333", marginLeft: 6 },
  value: { fontSize: 15, color: "#555", marginBottom: 8 },
  attachmentCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  attachmentImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 6,
  },
  attachmentFile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  attachmentText: { marginLeft: 6, color: "#8a2be2", fontSize: 14 },
  openText: { fontSize: 12, color: "#888" },
});
