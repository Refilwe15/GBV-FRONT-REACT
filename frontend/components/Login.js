import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ENV from "../.env";

// ✅ Reusable Message Modal
const MessageBox = ({ visible, type, message, onClose }) => {
  const iconName =
    type === "success"
      ? "check-circle"
      : type === "error"
      ? "times-circle"
      : "info-circle";

  const iconColor =
    type === "success"
      ? "#A78BFA" // purple-greenish for success
      : type === "error"
      ? "#C026D3" // pink-purple for error
      : "#8B5CF6"; // info purple

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: iconColor + "20" },
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

// ✅ Main Login Screen
export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("info");
  const [modalMessage, setModalMessage] = useState("");

  const showMessage = (type, message) => {
    setModalType(type);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showMessage("error", "Please enter both email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage("error", "Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch(`${ENV.BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("token", data.access_token);
        await AsyncStorage.setItem("user_type", data.user_type);
        await AsyncStorage.setItem("email", data.email);

        showMessage("success", "Login successful!");

        setTimeout(() => {
          setModalVisible(false);
          if (data.user_type === "admin") {
            navigation.replace("AdminDashboard");
          } else {
            navigation.replace("Dashboard");
          }
        }, 1500);
      } else if (data.detail?.toLowerCase().includes("invalid")) {
        showMessage("error", "Invalid email or password.");
      } else {
        showMessage("error", data.detail || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      showMessage("error", "Unable to connect to server.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.caption}>
        Sign in to continue protecting yourself and your community.
      </Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Icon name="envelope" size={18} color="#8B5CF6" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Icon name="lock" size={18} color="#8B5CF6" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Icon
            name={showPassword ? "eye" : "eye-slash"}
            size={18}
            color="#8B5CF6"
          />
        </TouchableOpacity>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity>
        <Text style={styles.forgot}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Icon
          name="sign-in-alt"
          size={18}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Register Link */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don’t have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerLink}> Register</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <MessageBox
        visible={modalVisible}
        type={modalType}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

// ✅ Purple themed styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
    backgroundColor: "#F3E8FF", // light purple
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#6D28D9", // strong purple
    marginBottom: 6,
    textAlign: "center",
  },
  caption: {
    fontSize: 15,
    color: "#6B21A8", // dark purple
    marginBottom: 30,
    textAlign: "center",
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
  eyeIcon: {
    marginLeft: "auto",
  },
  input: {
    flex: 1,
    height: 50,
    color: "#4C1D95", // deep purple text
    fontSize: 15,
  },
  forgot: {
    color: "#8B5CF6",
    textAlign: "right",
    marginBottom: 25,
    fontWeight: "600",
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#7C3AED", // purple button
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  registerText: {
    color: "#4C1D95",
  },
  registerLink: {
    color: "#7C3AED",
    fontWeight: "bold",
  },
  // Modal Styles
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
