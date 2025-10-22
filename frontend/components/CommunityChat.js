import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

export default function CommunityChat({ route, navigation }) {
  const { communityId } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const flatListRef = useRef();

  // Simulate fetching previous messages
  useEffect(() => {
    const initialMessages = [
      { id: 1, user: "Alice", text: "Hello everyone!", timestamp: "10:00 AM" },
      { id: 2, user: "Bob", text: "Hi Alice!", timestamp: "10:02 AM" },
    ];
    setMessages(initialMessages);
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      user: "You",
      text: input,
      timestamp: new Date().toLocaleTimeString().slice(0, 5) + " " + (new Date().getHours() >= 12 ? "PM" : "AM"),
    };
    setMessages([...messages, newMessage]);
    setInput("");

    // Scroll to bottom after sending
    setTimeout(() => {
      flatListRef.current.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageContainer, item.user === "You" ? styles.myMessage : styles.otherMessage]}>
      <Text style={styles.user}>{item.user}</Text>
      <Text style={styles.text}>{item.text}</Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.header}>Community Chat</Text>
      <Text style={styles.subHeader}>Community ID: {communityId}</Text>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.chatContainer}
      />

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Icon name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 10, paddingTop: 50 },
  header: { fontSize: 28, fontWeight: "bold", textAlign: "center", color: "#8a2be2" },
  subHeader: { fontSize: 14, textAlign: "center", color: "#6B7280", marginBottom: 10 },
  chatContainer: { paddingVertical: 10 },
  messageContainer: { maxWidth: "80%", marginVertical: 5, padding: 10, borderRadius: 12 },
  myMessage: { backgroundColor: "#8a2be2", alignSelf: "flex-end" },
  otherMessage: { backgroundColor: "#E5E7EB", alignSelf: "flex-start" },
  user: { fontWeight: "bold", color: "#fff", marginBottom: 2 },
  text: { color: "#fff" },
  timestamp: { fontSize: 10, color: "#D1D5DB", marginTop: 2, alignSelf: "flex-end" },
  inputWrapper: { flexDirection: "row", alignItems: "center", marginTop: "auto" },
  input: { flex: 1, height: 50, borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 25, paddingHorizontal: 15, backgroundColor: "#fff" },
  sendButton: { backgroundColor: "#8a2be2", padding: 12, borderRadius: 25, marginLeft: 8 },
});
