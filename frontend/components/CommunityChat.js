import React, { useState, useEffect, useRef } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

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

export default function CommunityChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [emojiModal, setEmojiModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const flatListRef = useRef();

  // Fetch logged-in user email from AsyncStorage
  useEffect(() => {
    const fetchEmail = async () => {
      const email = await AsyncStorage.getItem("email");
      if (email) setUserEmail(email);
    };
    fetchEmail();
  }, []);

  // Fetch messages from server
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

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (messages.length && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !userEmail) return;
    try {
      const res = await fetch(`${BASE_URL}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: userEmail, content: input }),
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

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.user_email === userEmail;
    return (
      <View
        style={[
          styles.messageBox,
          isCurrentUser ? styles.messageRight : styles.messageLeft,
        ]}
      >
        {!isCurrentUser && (
          <Text style={styles.userEmail}>{item.user_email}</Text>
        )}
        <Text style={[styles.messageText, isCurrentUser && { color: "#fff" }]}>
          {item.content}
        </Text>
        <Text style={[styles.timestamp, isCurrentUser && { color: "#D1D5DB" }]}>
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          style={styles.chatList}
          contentContainerStyle={{ paddingVertical: 10 }}
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
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E5DDD5" },
  chatList: { flex: 1, paddingHorizontal: 10 },
  messageBox: {
    maxWidth: "75%",
    padding: 10,
    marginVertical: 4,
    borderRadius: 16,
  },
  messageLeft: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderTopLeftRadius: 0,
  },
  messageRight: {
    alignSelf: "flex-end",
    backgroundColor: "#0B93F6",
    borderTopRightRadius: 0,
  },
  userEmail: {
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
    fontSize: 12,
  },
  messageText: { fontSize: 16, color: "#111" },
  timestamp: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "right",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F3F4F6",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
    backgroundColor: "#fff",
    color: "#111",
  },
  sendBtn: {
    backgroundColor: "#0B93F6",
    paddingHorizontal: 16,
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
    padding: 12,
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
    backgroundColor: "#0B93F6",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
});
