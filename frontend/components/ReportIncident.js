import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Switch,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ENV from "../.env";

const apiKey = "56da46010d5d487287ef5f2ef247c8ee";

export default function ReportIncident({ navigation }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [description, setDescription] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [media, setMedia] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch location suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            query
          )}&limit=5&apiKey=${apiKey}`
        );
        const data = await res.json();
        setSuggestions(data.features || []);
      } catch (err) {
        console.error(err);
      }
    }, 400);

    setTypingTimeout(timeout);
  }, [query]);

  // Pick media file
  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "video/*"],
      });
      if (result.type === "success") setMedia(result);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to pick a file.");
    }
  };

  // Submit incident report
  const handleSubmit = async () => {
    if (!query || !description) {
      Alert.alert(
        "Missing Fields",
        "Please fill in both location and description."
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("location", query);
      formData.append("description", description);
      formData.append("anonymous", anonymous ? "true" : "false");

      if (!anonymous) {
        const email = await AsyncStorage.getItem("email");
        if (email) {
          formData.append("reporter_email", email);
        } else {
          console.warn("No email found in AsyncStorage");
        }
      }

      if (media) {
        formData.append("attachment", {
          uri:
            Platform.OS === "android"
              ? media.uri
              : media.uri.replace("file://", ""),
          name: media.name,
          type: media.mimeType || "application/octet-stream",
        });
      }

      const response = await fetch(`${ENV.BACKEND_URL}/incidents/`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Incident Submitted", "Thank you for your report.");
        setQuery("");
        setDescription("");
        setAnonymous(false);
        setMedia(null);
      } else {
        Alert.alert("Submission Failed", data.detail || "Try again.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#333" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Report Incident</Text>

        {/* Location */}
        <View style={styles.labelRow}>
          <Ionicons name="location-outline" size={20} color="#8a2be2" />
          <Text style={styles.label}>Location</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter street or city"
            placeholderTextColor="#888"
            value={query}
            onChangeText={setQuery}
          />
        </View>
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.properties.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setQuery(item.properties.formatted);
                  setSuggestions([]);
                }}
              >
                <Text style={styles.suggestion}>
                  {item.properties.formatted}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Description */}
        <View style={styles.labelRow}>
          <Feather name="file-text" size={20} color="#8a2be2" />
          <Text style={styles.label}>Description</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the incident..."
            placeholderTextColor="#888"
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Media Upload */}
        <View style={styles.labelRow}>
          <Ionicons name="cloud-upload-outline" size={20} color="#8a2be2" />
          <Text style={styles.label}>Media Upload</Text>
        </View>
        <TouchableOpacity
          style={[styles.uploadCard, media && { borderColor: "#8a2be2" }]}
          activeOpacity={0.7}
          onPress={handleUpload}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <MaterialCommunityIcons
              name="file-upload-outline"
              size={22}
              color="#8a2be2"
            />
            <Text style={styles.uploadText}>Upload Image or Video</Text>
          </View>
          <Text style={styles.uploadDesc}>Attach evidence (optional)</Text>
          {media && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <MaterialCommunityIcons
                name="file-check-outline"
                size={18}
                color="#8a2be2"
              />
              <Text style={styles.uploadedFile}>{media.name}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Anonymous toggle */}
        <View style={styles.toggleContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Feather
              name="user-x"
              size={18}
              color="#8a2be2"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.toggleLabel}>Report Anonymously</Text>
          </View>
          <Switch
            value={anonymous}
            onValueChange={setAnonymous}
            trackColor={{ false: "#ccc", true: "#8a2be2" }}
            thumbColor={Platform.OS === "android" ? "#fff" : ""}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitBtn}
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Feather
                name="send"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.submitText}>Submit Report</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 40, paddingBottom: 50 },
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
    marginBottom: 6,
    marginTop: 10,
  },
  label: { fontSize: 16, fontWeight: "600", color: "#333", marginLeft: 6 },
  inputContainer: { position: "relative", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingLeft: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#222",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  suggestion: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 6,
    marginBottom: 3,
    color: "#222",
  },
  uploadCard: {
    backgroundColor: "#f9f9f9",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#ccc",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  uploadText: { fontWeight: "700", fontSize: 16, color: "#333" },
  uploadDesc: { color: "#555", fontSize: 13, marginTop: 4 },
  uploadedFile: { color: "#8a2be2", marginLeft: 6, fontSize: 13 },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    marginTop: 10,
  },
  toggleLabel: { fontSize: 16, fontWeight: "600", color: "#333" },
  submitBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#8a2be2",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#8a2be2",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 18 },
});
