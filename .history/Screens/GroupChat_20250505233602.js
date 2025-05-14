// screens/GroupChat.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet
} from 'react-native';
import firebase from '../Config';

export default function GroupChat({ route }) {
  const { groupId, groupName } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const ref = firebase.database().ref(`GroupMessages/${groupId}`);
    ref.on('value', snapshot => {
      const data = snapshot.val() || {};
      const msgList = Object.entries(data).map(([id, val]) => ({ id, ...val }));
      setMessages(msgList);
    });
    return () => ref.off();
  }, [groupId]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const ref = firebase.database().ref(`GroupMessages/${groupId}`);
    ref.push({
      text: input,
      sender: firebase.auth().currentUser.uid,
      timestamp: new Date().toISOString(),
    });
    setInput('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{groupName}</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageBubble}>
            <Text>{item.text}</Text>
            <Text style={styles.sender}>{item.sender}</Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={{ color: '#fff' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  messageBubble: {
    backgroundColor: '#eaeaea',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  sender: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: '#6200EE',
    padding: 10,
    borderRadius: 25,
    marginLeft: 10,
  },
});
