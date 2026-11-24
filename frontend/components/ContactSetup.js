import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Storage from "../utils/storage";

export default function ContactPinSetup({ navigation }) {
  const [contact, setContact] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState(null);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedContact = await Storage.getItem("emergency_contact");
        const savedPin = await Storage.getItem("emergency_pin");
        if (savedContact) setContact(savedContact);
        if (savedPin) setPin(savedPin);
      } catch (error) {
        console.log("Failed to load data:", error);
        showMessage("Failed to load saved settings.", 'error');
      }
    };
    loadData();
  }, []);

  const saveContact = async () => {
    const phoneRegex = /^\+\d{10,13}$/;
    if (!phoneRegex.test(contact)) {
      showMessage(
        "Invalid Number: Please include your country code (e.g. +27XXXXXXXXX).",
        'error'
      );
      return;
    }
    try {
      await Storage.setItem("emergency_contact", contact);
      showMessage("Your emergency contact has been saved!", 'success');
    } catch (error) {
      showMessage("Could not save your contact. Try again.", 'error');
    }
  };

  const savePin = async () => {
    const pinRegex = /^\d{4}$/;
    if (!pinRegex.test(pin)) {
      showMessage("Invalid PIN: PIN must be exactly 4 digits.", 'error');
      return;
    }
    try {
      await Storage.setItem("emergency_pin", pin);
      showMessage("Your emergency PIN has been saved!", 'success');
    } catch (error) {
      showMessage("Could not save PIN. Try again.", 'error');
    }
  };

  const clearContact = async () => {
    try {
      await Storage.removeItem("emergency_contact");
      setContact("");
      showMessage("Emergency contact removed.", 'success');
    } catch (error) {
      showMessage("Failed to remove contact.", 'error');
    }
  };

  const clearPin = async () => {
    try {
      await Storage.removeItem("emergency_pin");
      setPin("");
      showMessage("Emergency PIN removed.", 'success');
    } catch (error) {
      showMessage("Failed to remove PIN.", 'error');
    }
  };

  const MessageBox = () => {
    if (!message) return null;
    const isError = message.type === 'error';
    const iconName = isError ? "exclamation-triangle" : "check-circle";

    return (
      <View style={[styles.messageBox, isError ? styles.messageBoxError : styles.messageBoxSuccess]}>
        <Icon name={iconName} size={20} color="#fff" style={styles.messageIcon} />
        <Text style={styles.messageText}>{message.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <MessageBox />

      <View style={styles.iconContainer}>
        <Icon name="phone" size={40} color="#7C3AED" />
      </View>
      
      <Text style={styles.title}>Set Emergency Contact & PIN</Text>

      <Text style={styles.label}>Emergency Contact Number</Text>
      <TextInput
        style={styles.input}
        placeholder="+27XXXXXXXXX"
        value={contact}
        onChangeText={setContact}
        keyboardType="phone-pad"
        maxLength={13}
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: "#7C3AED" }]} onPress={saveContact}>
        <Icon name="save" size={18} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Save Contact</Text>
      </TouchableOpacity>
      {contact ? (
        <TouchableOpacity style={[styles.button, { backgroundColor: "#D946EF" }]} onPress={clearContact}>
          <Icon name="trash" size={18} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Remove Contact</Text>
        </TouchableOpacity>
      ) : null}

      <Text style={[styles.label, { marginTop: 15 }]}>4-Digit Emergency PIN</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter 4-digit PIN"
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        maxLength={4}
        secureTextEntry
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: "#A78BFA" }]} onPress={savePin}>
        <Icon name="lock" size={18} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Save PIN</Text>
      </TouchableOpacity>
      {pin ? (
        <TouchableOpacity style={[styles.button, { backgroundColor: "#D946EF" }]} onPress={clearPin}>
          <Icon name="unlock" size={18} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Remove PIN</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={18} color="#111827" style={styles.icon} />
        <Text style={styles.backButtonText}>Back to Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    padding: 24,
    paddingTop: 60,
  },
  iconContainer: {
    marginBottom: 25,
    backgroundColor: '#EDE9FE',
    borderRadius: 50,
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#5B21B6",
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    width: "100%",
    textAlign: "left",
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#6D28D9',
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#C4B5FD",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    marginBottom: 16,
    fontSize: 16,
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 16,
    width: "100%",
    justifyContent: "center",
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  backButton: {
    backgroundColor: "#EDE9FE",
    marginTop: 20,
    shadowOpacity: 0.05,
    elevation: 2,
  },
  icon: { marginRight: 10 },
  buttonText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  backButtonText: { fontSize: 16, fontWeight: "700", color: "#5B21B6" },
  messageBox: {
    position: 'absolute',
    top: 30,
    zIndex: 10,
    width: '90%',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  messageBoxSuccess: {
    backgroundColor: '#7C3AED',
  },
  messageBoxError: {
    backgroundColor: '#D946EF',
  },
  messageIcon: {
    marginRight: 12,
  },
  messageText: {
    color: '#fff',
    fontWeight: '600',
    flexShrink: 1,
  },
});
