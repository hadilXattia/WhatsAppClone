import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet
} from 'react-native';
import firebase from '../Config';
import { Ionicons } from '@expo/vector-icons';
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
  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]?.base64) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      sendMessage(base64Img);
    }
  };

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

    <View style={styles.inputContainer}>
      <TouchableOpacity onPress={pickImage} style={{ marginRight: 10 }}>
            <Ionicons name="image-outline" size={26} color="green" />
          </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={handleTyping}
          placeholder="Type a message..."
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text   style={styles.input}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles remain the same as your original
const styles = StyleSheet.create({
    wrapper: {
      flex: 1,
    },
    chatList: {
      backgroundColor: '#f1f1f1',
      width: '100%',
      marginBottom: 70,
    },
    inputContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
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
    messageWrapper: {
      marginHorizontal: 10,
      marginVertical: 6,
    },
    messageBubble: {
      padding: 10,
      borderRadius: 10,
      maxWidth: '80%',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 2,
      elevation: 2,
    },
    me: {
      backgroundColor: '#DCF8C6',
    },
    other: {
      backgroundColor: '#E5E5EA',
    },
    messageText: {
      fontSize: 16,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    seenIcon: {
      marginLeft: 6,
      marginTop: 2,
    },
    time: {
      fontSize: 11,
      color: 'gray',
    },
    dateHeader: {
      alignItems: 'center',
      marginVertical: 10,
    },
    dateText: {
      backgroundColor: '#ccc',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      fontSize: 12,
      color: '#333',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 15,
      paddingHorizontal: 20,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
    container: {
      flex: 1,
      backgroundColor: "#f2cdff",
      paddingTop: 30,
      paddingHorizontal: 10,
    },
  });
  