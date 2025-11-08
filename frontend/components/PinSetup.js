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
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PinSetup({ navigation }) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    const loadPin = async () => {
      try {
        const saved = await AsyncStorage.getItem("user_pin");
        if (saved) setPin(saved);
      } catch (error) {
        console.log("Failed to load PIN:", error);
      }
    };
    loadPin();
  }, []);

  const savePin = async () => {
    if (!/^\d{4,6}$/.test(pin)) {
      Alert.alert("Invalid PIN", "PIN must be 4-6 digits.");
      return;
    }
    try {
      await AsyncStorage.setItem("user_pin", pin);
      Alert.alert("Saved", "Your PIN has been set!");
      navigation.goBack();
    } catch (error) {
      console.log("Save PIN error:", error);
      Alert.alert("Error", "Could not save PIN.");
    }
  };

  return (
    <View style={styles.container}>
      <Icon name="lock" size={50} color="blue" style={{ marginBottom: 15 }} />
      <Text style={styles.title}>Set Your PIN</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter 4-6 digit PIN"
        keyboardType="number-pad"
        secureTextEntry
        value={pin}
        onChangeText={setPin}
        maxLength={6}
      />

      <TouchableOpacity style={styles.button} onPress={savePin}>
        <Icon name="save" size={18} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Save PIN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    backgroundColor: "#F9FAFB",
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: {
    width: "85%",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "#fff",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "blue",
    paddingVertical: 14,
    borderRadius: 10,
    width: "85%",
    justifyContent: "center",
  },
  icon: { marginRight: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
