import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet
} from 'react-native';
import firebase from '../Config';

export default function GroupChat({ route }) {
  const { groupId, groupName } = route.params;
  const currentUser = firebase.auth().currentUser;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [usernames, setUsernames] = useState({});
  const [isTyping, setIsTyping] = useState({});
  const [typingStatus, setTypingStatus] = useState('');

  // Fetch usernames
  const usersRef = firebase.database().ref('ListAccounts');
  usersRef.once('value').then(snapshot => {
    const data = snapshot.val() || {};
    const nameMap = {};
  
    Object.entries(data).forEach(([uid, userData]) => {
      const fullName = `${userData.FirstName || ''} ${userData.LastName || ''}`.trim();
      nameMap[uid] = fullName || uid; // fallback to UID if name missing
    });
  
    setUsernames(nameMap);
  });
  

  // Fetch messages
  useEffect(() => {
    const ref = firebase.database().ref(`GroupMessages/${groupId}`);
    ref.on('value', snapshot => {
      const data = snapshot.val() || {};
      const msgList = Object.entries(data).map(([id, val]) => ({ id, ...val }));
      setMessages(msgList);
    });

    return () => ref.off();
  }, [groupId]);

  // Typing status listener
  useEffect(() => {
    const typingRef = firebase.database().ref(`GroupTyping/${groupId}`);
    typingRef.on('value', snapshot => {
      const data = snapshot.val() || {};
      const typingUsers = Object.entries(data)
        .filter(([uid, val]) => uid !== currentUser.uid && val === true)
        .map(([uid]) => usernames[uid] || 'Someone');

      if (typingUsers.length > 0) {
        setTypingStatus(`${typingUsers.join(', ')} is typing...`);
      } else {
        setTypingStatus('');
      }
    });

    return () => typingRef.off();
  }, [usernames]);

  const handleTyping = (text) => {
    setInput(text);
    const typingRef = firebase.database().ref(`GroupTyping/${groupId}/${currentUser.uid}`);
    typingRef.set(text.length > 0);
    setTimeout(() => typingRef.set(false), 3000);
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const ref = firebase.database().ref(`GroupMessages/${groupId}`);
    ref.push({
      text: input,
      sender: currentUser.uid,
      timestamp: new Date().toISOString(),
      seenBy: {
        [currentUser.uid]: true
      }
    });
    setInput('');
  };

  // Mark messages as seen
  useEffect(() => {
    const ref = firebase.database().ref(`GroupMessages/${groupId}`);
    ref.once('value', snapshot => {
      const updates = {};
      snapshot.forEach(child => {
        updates[`${child.key}/seenBy/${currentUser.uid}`] = true;
      });
      ref.update(updates);
    });
  }, [groupId]);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{groupName}</Text>

      {typingStatus ? (
        <Text style={styles.typing}>{typingStatus}</Text>
      ) : null}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageBubble}>
            <Text>{item.text}</Text>
            <Text style={styles.meta}>
              {usernames[item.sender] || item.sender} • {formatTime(item.timestamp)}
            </Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={handleTyping}
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
  container: {
    flex: 1,
    backgroundColor: "#f2cdff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  typing: {
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 10
  },
  messageBubble: {
    backgroundColor: '#eaeaea',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  meta: {
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
