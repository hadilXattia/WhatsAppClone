import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Button,
  SectionList,
  TouchableOpacity,
  Image
} from 'react-native';
import firebase from '../Config';

const database = firebase.database();
const ref_listDiscussion = database.ref().child("ListDisscussion");
const ref_users = database.ref().child("users");

const Chat = (props) => {
  const currentid = props.route?.params?.currentid;
  const secondid = props.route?.params?.secondid;
  const discussionId = currentid > secondid ? currentid + secondid : secondid + currentid;

  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [secondUser, setSecondUser] = useState(null);

  const ref_messages = ref_listDiscussion.child(discussionId).child("messages");

  useEffect(() => {
    const userRef = ref_users.child(secondid);
    userRef.on("value", (snapshot) => {
      setSecondUser(snapshot.val());
    });

    return () => userRef.off();
  }, []);

  useEffect(() => {
    ref_messages.on("value", (snapshot) => {
      const d = [];
      snapshot.forEach((un_msg) => {
        d.push({ key: un_msg.key, ...un_msg.val() });
      });
      setMessages(d);
    });

    return () => ref_messages.off();
  }, []);

  useEffect(() => {
    // Mark last message as seen if it's for current user
    const markLastSeen = () => {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.receiverId === currentid && !lastMsg.seen) {
        ref_messages.child(lastMsg.key).update({ seen: true });
      }
    };
    markLastSeen();
  }, [messages]);

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach((message) => {
      const date = new Date(message.time).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(message);
    });
    return Object.keys(grouped).map((date) => ({ title: date, data: grouped[date] }));
  };

  const sendMessage = () => {
    if (!msg.trim()) return;
    const messageRef = ref_messages.push();
    const message = {
      body: msg,
      senderId: currentid,
      receiverId: secondid,
      time: new Date().toISOString(),
      seen: false,
    };
    messageRef.set(message)
      .then(() => setMsg(""))
      .catch((error) => console.error("Error sending message:", error));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.username}>{secondUser?.name}</Text>
          <Text style={styles.status}>{secondUser?.online ? 'Online' : 'Offline'}</Text>
        </View>
        <TouchableOpacity onPress={() => props.navigation.navigate('UserProfile', { userId: secondid })}>
          <Image source={{ uri: secondUser?.profileImage || 'https://via.placeholder.com/40' }} style={styles.profileIcon} />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={groupMessagesByDate(messages)}
        keyExtractor={(item, index) => index.toString()}
        style={{ flex: 1, paddingHorizontal: 10 }}
        renderItem={({ item }) => {
          const isMe = item.senderId === currentid;
          return (
            <View style={[styles.messageBubble, isMe ? styles.me : styles.other]}>
              <Text style={styles.messageText}>{item.body}</Text>
              <Text style={styles.time}>
                {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {isMe && item === messages[messages.length - 1] ? item.seen ? ' ✓✓' : ' ✓' : ''}
              </Text>
            </View>
          );
        }}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>{title}</Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={msg}
          onChangeText={setMsg}
        />
        <Button title="Send" onPress={sendMessage} color="green" />
      </View>
    </KeyboardAvoidingView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  header: {
    paddingTop: 40,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 12,
    color: 'gray',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  messageBubble: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  me: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  other: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
  },
  time: {
    fontSize: 10,
    color: 'gray',
    marginTop: 5,
    textAlign: 'right',
  },
  dateHeader: {
    alignSelf: 'center',
    backgroundColor: '#ddd',
    padding: 5,
    borderRadius: 10,
    marginVertical: 10,
  },
  dateHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
});
