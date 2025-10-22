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
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import * as Location from "expo-location";

export default function Greet({ navigation }) {
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [pin, setPin] = useState("");
  const [reason, setReason] = useState("");
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // SOS Button Pulse Animation
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

  // SOS button handler
  const sendSOS = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Enable location to send SOS.");
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      console.log("Sending SOS...", { latitude, longitude });

      // Send to API
      await fetch("https://sos-project.onrender.com/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      })
        .then((res) => {
          if (!res.ok) {
            console.log("Response not OK", res.status);
          }
          return res.json().catch(() => ({})); // ignore JSON parse errors
        })
        .then((data) => {
          console.log("SOS sent:", data);
          Alert.alert("Success", "SOS sent successfully!");
        })
        .catch((err) => {
          console.warn("Network issue:", err);
          Alert.alert(
            "Warning",
            "SOS sent (network may have delayed response)."
          );
        });
    } catch (err) {
      console.error("SOS Error:", err);
      Alert.alert("Error", "Failed to send SOS. Try again.");
    }
  };

  // Cancel modal submit
  const handleCancelSubmit = () => {
    if (!pin || !reason) {
      Alert.alert("Missing Fields", "Please enter your PIN and a reason.");
      return;
    }
    setCancelModalVisible(false);
    Alert.alert("Cancelled", "Your SOS request has been cancelled.");
    setPin("");
    setReason("");
  };

  return (
    <View style={styles.container}>
      {/* SOS Button */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={styles.sosButton}
          onPress={sendSOS}
          activeOpacity={0.8}
        >
          <Icon name="exclamation-triangle" size={50} color="#fff" />
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Title */}
      <Text style={styles.title}>
        NO TO <Text style={{ color: "red" }}>GBV</Text>
      </Text>
      <Text style={styles.subtitle}>An immediate, life-saving resource.</Text>

      {/* Cancel SOS */}
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: "#F3F4F6" }]}
        onPress={() => setCancelModalVisible(true)}
        activeOpacity={0.9}
      >
        <Icon
          name="times-circle"
          size={18}
          color="#111827"
          style={styles.icon}
        />
        <Text style={[styles.actionText, { color: "#111827" }]}>Cancel SOS</Text>
      </TouchableOpacity>

      {/* Login */}
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: "blue" }]}
        onPress={() => navigation.navigate("Login")}
        activeOpacity={0.9}
      >
        <Icon name="sign-in" size={18} color="#fff" style={styles.icon} />
        <Text style={[styles.actionText, { color: "#fff" }]}>Login</Text>
      </TouchableOpacity>

      {/* Cancel Modal */}
      <Modal visible={cancelModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Icon
              name="ban"
              size={40}
              color="#EF4444"
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.modalTitle}>Cancel SOS Request</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter PIN"
              secureTextEntry
              value={pin}
              onChangeText={setPin}
            />

            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Reason for cancellation"
              value={reason}
              onChangeText={setReason}
              multiline
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCancelSubmit}
            >
              <Icon name="check-circle" size={18} color="#fff" style={styles.icon} />
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeButton, { marginTop: 10 }]}
              onPress={() => setCancelModalVisible(false)}
            >
              <Icon name="times" size={18} color="#EF4444" style={styles.icon} />
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Footer */}
      <Text style={styles.footer}>
        Don’t have an account?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate("Register")}>
          Register here
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  sosButton: {
    backgroundColor: "#EF4444",
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  sosText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 25,
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 14,
    width: "85%",
    justifyContent: "center",
    marginVertical: 8,
  },
  icon: {
    marginRight: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
  },
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
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    backgroundColor: "#F9FAFB",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "blue",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
    justifyContent: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  closeText: {
    color: "#EF4444",
    fontWeight: "bold",
    marginLeft: 5,
  },
  footer: {
    marginTop: 25,
    fontSize: 14,
    color: "#374151",
  },
  link: {
    color: "blue", 
    fontWeight: "bold",
  },
});
