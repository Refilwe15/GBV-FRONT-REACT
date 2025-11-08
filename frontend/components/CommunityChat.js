import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

const BASE_URL = "http://10.0.0.114:8000";
const EMOJIS = [
  "😀",
  "😂",
  "😍",
  "🥰",
  "😎",
  "😭",
  "😡",
  "👍",
  "👎",
  "🙏",
  "🎉",
  "💯",
];
const HARDCODED_EMAIL = "user@example.com";

export default function CommunityChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [emojiModal, setEmojiModal] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${BASE_URL}/chat/`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: HARDCODED_EMAIL, content: input }), // send hardcoded email
      });
      if (!res.ok) throw new Error("Failed to send message");
      setInput("");
      fetchMessages();
    } catch (err) {
      console.log(err.message);
    }
  };

  const addEmoji = (emoji) => {
    setInput((prev) => prev + emoji);
    setEmojiModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.messageBox}>
              <Text style={styles.userEmail}>{item.user_email}</Text>
              <Text style={styles.messageText}>{item.content}</Text>
              <Text style={styles.timestamp}>
                {new Date(item.created_at).toLocaleTimeString()}
              </Text>
            </View>
          )}
          style={styles.chatList}
        />

        {/* Emoji Modal */}
        <Modal visible={emojiModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.emojiGrid}>
              <ScrollView
                contentContainerStyle={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {EMOJIS.map((e) => (
                  <TouchableOpacity
                    key={e}
                    onPress={() => addEmoji(e)}
                    style={styles.emojiBtn}
                  >
                    <Text style={{ fontSize: 28 }}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setEmojiModal(false)}
                style={styles.closeBtn}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={() => setEmojiModal(true)}>
            <Text style={styles.emojiToggle}>😊</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={{ color: "#fff" }}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  chatList: { flex: 1, padding: 10 },
  messageBox: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  userEmail: { fontWeight: "700", color: "#1E40AF" },
  messageText: { fontSize: 16 },
  timestamp: { fontSize: 10, color: "#6B7280", textAlign: "right" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#D1D5DB",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 8,
    backgroundColor: "#fff",
  },
  sendBtn: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emojiToggle: { fontSize: 28 },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  emojiGrid: {
    backgroundColor: "#fff",
    padding: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  emojiBtn: {
    width: "12%",
    padding: 6,
    alignItems: "center",
    marginVertical: 5,
  },
  closeBtn: {
    marginTop: 10,
    backgroundColor: "#3B82F6",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
});
