import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import ENV from "../.env";

// ✅ Reusable MessageBox with purple theme
const MessageBox = ({ visible, type, message, onClose }) => {
  const iconColor =
    type === "success"
      ? "#A78BFA" // lighter purple
      : type === "error"
      ? "#9333EA" // purple-red for error
      : "#8B5CF6"; // info purple

  const iconName =
    type === "success"
      ? "check-circle"
      : type === "error"
      ? "times-circle"
      : "info-circle";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <View style={[styles.iconCircle, { backgroundColor: iconColor + "20" }]}>
            <Icon name={iconName} size={48} color={iconColor} />
          </View>
          <Text style={styles.modalMessage}>{message}</Text>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: iconColor }]}
            onPress={onClose}
          >
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function Greet({ navigation }) {
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [pin, setPin] = useState("");
  const [reason, setReason] = useState("");
  const [recording, setRecording] = useState(null);

  const [msgVisible, setMsgVisible] = useState(false);
  const [msgType, setMsgType] = useState("info");
  const [msgText, setMsgText] = useState("");

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 900,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const showMessage = (type, text) => {
    setMsgType(type);
    setMsgText(text);
    setMsgVisible(true);
  };

  // ===== NORMAL SOS =====
  const sendSOS = async (customMessage) => {
    try {
      const userEmail = await AsyncStorage.getItem("email");
      if (!userEmail) {
        showMessage("error", "Please login to send SOS.");
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showMessage("error", "Enable location to send SOS.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const phone = (await AsyncStorage.getItem("emergency_contact")) || "+27672531917";

      const message = customMessage || "SOS Alert! I need help!";

      const response = await fetch(`${ENV.BACKEND_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude, phone, message }),
      });

      if (response.ok) {
        showMessage("success", "SOS sent successfully!");
      } else {
        const data = await response.json();
        showMessage("error", data.detail || "Failed to send SOS.");
      }
    } catch (err) {
      console.error("SOS Error:", err);
      showMessage("error", "Failed to send SOS. Try again.");
    }
  };

  // ===== VOICE RECORDING =====
  const startRecording = async () => {
    try {
      if (Platform.OS === "web") {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.chunks = [];
        mediaRecorder.ondataavailable = (e) => mediaRecorder.chunks.push(e.data);
        mediaRecorder.onstop = async () => {
          const blob = new Blob(mediaRecorder.chunks, { type: "audio/webm" });
          await uploadRecording(blob);
        };
        mediaRecorder.start();
        setRecording(mediaRecorder);
        showMessage("info", "Recording started...");
      } else {
        const permission = await Audio.requestPermissionsAsync();
        if (!permission.granted) {
          showMessage("error", "Microphone access denied.");
          return;
        }
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(recording);
        showMessage("info", "Recording started...");
      }
    } catch (error) {
      console.error("Recording error:", error);
      showMessage("error", "Failed to start recording.");
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      if (Platform.OS === "web") {
        recording.stop();
        setRecording(null);
      } else {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        const file = { uri, name: "sos_recording.m4a", type: "audio/m4a" };
        await uploadRecording(file, true);
        setRecording(null);
      }
      showMessage("success", "Recording stopped and sent successfully!");
    } catch (err) {
      console.error("Stop recording error:", err);
      showMessage("error", "Failed to stop recording.");
    }
  };

  const uploadRecording = async (audio, isMobile = false, customMessage) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const phone = (await AsyncStorage.getItem("emergency_contact")) || "+27672531917";

      const formData = new FormData();
      formData.append("latitude", latitude.toString());
      formData.append("longitude", longitude.toString());
      formData.append("phone", phone);

      if (isMobile) {
        formData.append("file", { uri: audio.uri, name: "sos_recording.m4a", type: "audio/m4a" });
      } else {
        formData.append("file", audio, "sos_recording.webm");
      }

      if (customMessage) formData.append("message", customMessage);

      const response = await fetch(`${ENV.BACKEND_URL}/upload-voice`, { method: "POST", body: formData });
      const result = await response.json();

      if (response.ok) {
        showMessage("success", "Voice SOS sent successfully!");
      } else {
        console.error("Upload failed:", result);
        showMessage("error", JSON.stringify(result));
      }
    } catch (err) {
      console.error("Upload error:", err);
      showMessage("error", "Failed to send voice SOS.");
    }
  };

  // ===== CANCEL SOS =====
  const handleCancelSubmit = async () => {
    if (!pin || !reason) {
      showMessage("error", "Please enter your PIN and a reason.");
      return;
    }

    try {
      const savedPin = await AsyncStorage.getItem("emergency_pin");
      const message =
        savedPin && pin === savedPin
          ? `SOS Cancelled. User sent it by mistake. Reason: ${reason}`
          : `SOS Cancelled. User may have been forced. Reason: ${reason}`;

      if (recording) {
        await stopRecording();
        await uploadRecording(recording, Platform.OS !== "web", message);
      } else {
        await sendSOS(message);
      }

      setCancelModalVisible(false);
      setPin("");
      setReason("");

      showMessage("success", "SOS request has been successfully cancelled!");
    } catch (err) {
      console.error("Cancel SOS Error:", err);
      showMessage("error", "Failed to cancel SOS request.");
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[
            styles.sosButton,
            { backgroundColor: recording ? "#7C3AED" : "#8B5CF6" },
          ]}
          onPress={() => sendSOS()}
          onLongPress={startRecording}
          onPressOut={stopRecording}
          delayLongPress={300}
          activeOpacity={0.8}
        >
          <Icon name="exclamation-triangle" size={50} color="#fff" />
          <Text style={styles.sosText}>{recording ? "Recording..." : "SOS"}</Text>
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.title}>
        NO TO <Text style={{ color: "#8B5CF6" }}>GBV</Text>
      </Text>
      <Text style={styles.subtitle}>An immediate, life-saving resource.</Text>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: "#EDE9FE" }]}
        onPress={() => setCancelModalVisible(true)}
      >
        <Icon name="times-circle" size={18} color="#7C3AED" style={styles.icon} />
        <Text style={[styles.actionText, { color: "#7C3AED" }]}>Cancel SOS</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: "#8B5CF6" }]}
        onPress={() => navigation.navigate("Login")}
      >
        <Icon name="sign-in" size={18} color="#fff" style={styles.icon} />
        <Text style={[styles.actionText, { color: "#fff" }]}>Login</Text>
      </TouchableOpacity>

      {/* Cancel Modal */}
      <Modal visible={cancelModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Icon name="ban" size={40} color="#8B5CF6" style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitle}>Cancel SOS Request</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter PIN"
              secureTextEntry
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              maxLength={6}
            />

            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Reason for cancellation"
              value={reason}
              onChangeText={setReason}
              multiline
            />

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: "#8B5CF6" }]}
              onPress={handleCancelSubmit}
            >
              <Icon name="check-circle" size={18} color="#fff" style={styles.icon} />
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeButton, { marginTop: 10 }]}
              onPress={() => setCancelModalVisible(false)}
            >
              <Icon name="times" size={18} color="#8B5CF6" style={styles.icon} />
              <Text style={[styles.closeText, { color: "#8B5CF6" }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MessageBox */}
      <MessageBox
        visible={msgVisible}
        type={msgType}
        message={msgText}
        onClose={() => setMsgVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F7FF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  sosText: { color: "#fff", fontSize: 34, fontWeight: "900", marginTop: 8 },
  title: { fontSize: 30, fontWeight: "bold", marginTop: 25, color: "#111827" },
  subtitle: { fontSize: 14, color: "#6B7280", marginBottom: 30 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 14,
    width: "85%",
    justifyContent: "center",
    marginVertical: 8,
  },
  icon: { marginRight: 8 },
  actionText: { fontSize: 16, fontWeight: "600" },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111827", marginBottom: 15 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#DDD6FE",
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    backgroundColor: "#F9F7FF",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
    justifyContent: "center",
  },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  closeButton: { flexDirection: "row", alignItems: "center" },
  closeText: { fontWeight: "bold", marginLeft: 5 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 15 },
  modalMessage: { fontSize: 16, color: "#111827", textAlign: "center", marginVertical: 10 },
  modalButton: { borderRadius: 8, paddingVertical: 10, paddingHorizontal: 25, marginTop: 10 },
  modalButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
