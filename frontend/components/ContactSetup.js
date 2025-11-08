import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Storage from "../utils/storage"; // make sure Storage has getItem, setItem, removeItem

export default function ContactPinSetup({ navigation }) {
  const [contact, setContact] = useState("");
  const [pin, setPin] = useState("");

  // 🔁 Load saved contact and PIN on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedContact = await Storage.getItem("emergency_contact");
        const savedPin = await Storage.getItem("emergency_pin");
        if (savedContact) setContact(savedContact);
        if (savedPin) setPin(savedPin);
      } catch (error) {
        console.log("Failed to load data:", error);
      }
    };
    loadData();
  }, []);

  // ✅ Validate and save contact
  const saveContact = async () => {
    const phoneRegex = /^\+\d{10,13}$/;

    if (!phoneRegex.test(contact)) {
      Alert.alert(
        "Invalid Number",
        "Please include your country code (e.g. +27XXXXXXXXX)."
      );
      return;
    }

    try {
      await Storage.setItem("emergency_contact", contact);
      Alert.alert("Saved", "Your emergency contact has been saved!");
    } catch (error) {
      Alert.alert("Error", "Could not save your contact. Try again.");
      console.error("Save contact error:", error);
    }
  };

  // ✅ Validate and save PIN
  const savePin = async () => {
    const pinRegex = /^\d{4}$/; // 4-digit PIN

    if (!pinRegex.test(pin)) {
      Alert.alert("Invalid PIN", "PIN must be exactly 4 digits.");
      return;
    }

    try {
      await Storage.setItem("emergency_pin", pin);
      Alert.alert("Saved", "Your emergency PIN has been saved!");
    } catch (error) {
      Alert.alert("Error", "Could not save PIN. Try again.");
      console.error("Save PIN error:", error);
    }
  };

  // 🗑️ Remove contact
  const clearContact = async () => {
    try {
      await Storage.removeItem("emergency_contact");
      setContact("");
      Alert.alert("Removed", "Emergency contact removed.");
    } catch (error) {
      console.log("Remove contact error:", error);
    }
  };

  // 🗑️ Remove PIN
  const clearPin = async () => {
    try {
      await Storage.removeItem("emergency_pin");
      setPin("");
      Alert.alert("Removed", "Emergency PIN removed.");
    } catch (error) {
      console.log("Remove PIN error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Icon name="phone" size={40} color="blue" style={{ marginBottom: 15 }} />
      <Text style={styles.title}>Set Emergency Contact & PIN</Text>

      {/* Contact Input */}
      <TextInput
        style={styles.input}
        placeholder="+27XXXXXXXXX"
        value={contact}
        onChangeText={setContact}
        keyboardType="phone-pad"
        maxLength={13}
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "blue" }]}
        onPress={saveContact}
        activeOpacity={0.8}
      >
        <Icon name="save" size={18} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Save Contact</Text>
      </TouchableOpacity>
      {contact ? (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#EF4444" }]}
          onPress={clearContact}
          activeOpacity={0.8}
        >
          <Icon name="trash" size={18} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Remove Contact</Text>
        </TouchableOpacity>
      ) : null}

      {/* PIN Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter 4-digit PIN"
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        maxLength={4}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#10B981" }]}
        onPress={savePin}
        activeOpacity={0.8}
      >
        <Icon name="save" size={18} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Save PIN</Text>
      </TouchableOpacity>
      {pin ? (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#EF4444" }]}
          onPress={clearPin}
          activeOpacity={0.8}
        >
          <Icon name="trash" size={18} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Remove PIN</Text>
        </TouchableOpacity>
      ) : null}

      {/* Back Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#F3F4F6" }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Icon name="arrow-left" size={18} color="#111827" style={styles.icon} />
        <Text style={[styles.buttonText, { color: "#111827" }]}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "85%",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 12,
    fontSize: 16,
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 14,
    width: "85%",
    justifyContent: "center",
    marginVertical: 6,
  },
  icon: { marginRight: 8 },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
