import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import ENV from "../.env";

// ✅ Reusable message box with styled icons
const MessageBox = ({ visible, type, message, onClose }) => {
  const iconName =
    type === "success"
      ? "check-circle"
      : type === "error"
      ? "times-circle"
      : "info-circle";

  const iconColor =
    type === "success"
      ? "#A78BFA" // purple for success
      : type === "error"
      ? "#C026D3" // pinkish purple for error
      : "#8B5CF6"; // info purple

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: iconColor + "20" }, // transparent bg
            ]}
          >
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

// ✅ Main Register screen
export default function Register({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("info");
  const [modalMessage, setModalMessage] = useState("");

  const showMessage = (type, message) => {
    setModalType(type);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleRegister = async () => {
    if (!username || !email || !password) {
      showMessage("error", "All fields are required!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage("error", "Please enter a valid email address!");
      return;
    }

    try {
      const response = await fetch(`${ENV.BACKEND_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage("success", "Account created successfully!");
        setTimeout(() => {
          setModalVisible(false);
          navigation.navigate("Login");
        }, 1800);
      } else if (data.detail?.toLowerCase().includes("already")) {
        showMessage("error", "This user already exists.");
      } else if (data.detail?.toLowerCase().includes("invalid email")) {
        showMessage("error", "Invalid email address.");
      } else {
        showMessage("error", data.detail || "Registration failed. Try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("error", "Unable to connect to the server.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>
      <Text style={styles.caption}>
        Join us and take the first step towards safety and empowerment.
      </Text>

      <View style={styles.inputContainer}>
        <Icon name="user-alt" size={18} color="#8B5CF6" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="envelope" size={18} color="#8B5CF6" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={18} color="#8B5CF6" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Icon
          name="user-plus"
          size={18}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.registerText}>Register</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Already have an account?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
          Login
        </Text>
      </Text>

      {/* Custom Modal */}
      <MessageBox
        visible={modalVisible}
        type={modalType}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

// ✅ Purple themed styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#F3E8FF", // light purple background
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
    color: "#6D28D9", // strong purple
  },
  caption: {
    fontSize: 15,
    color: "#6B21A8", // dark purple
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D8B4FE", // light purple border
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#4C1D95", // deep purple text
    fontSize: 15,
  },
  registerButton: {
    flexDirection: "row",
    backgroundColor: "#7C3AED", // purple button
    padding: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  registerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
    color: "#4C1D95",
  },
  link: {
    color: "#7C3AED",
    fontWeight: "bold",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#F3E8FF",
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    color: "#4C1D95",
    textAlign: "center",
    marginVertical: 10,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 25,
    marginTop: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
