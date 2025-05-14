import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Image
} from 'react-native';
import firebase from '../Config';
import moment from 'moment';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function GroupChat({ route }) {
  const { groupId, groupName } = route.params;
  const currentUser = firebase.auth().currentUser;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [usernames, setUsernames] = useState({});
  const [typingStatus, setTypingStatus] = useState('');

  useEffect(() => {
    firebase.database().ref('ListAccounts').once('value').then(snapshot => {
      const data = snapshot.val() || {};
      const map = {};
      Object.entries(data).forEach(([uid, val]) => {
        const name = `${val.FirstName || ''} ${val.LastName || ''}`.trim();
        map[uid] = name || uid;
      });
      setUsernames(map);
    });
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]?.base64) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      sendMessage(base64Img, true);
    }
  };

  const sendMessage = (content, isImage = false) => {
    if (!content.trim()) return;
    const ref = firebase.database().ref(`GroupMessages/${groupId}`);
    ref.push({
      text: isImage ? '' : content,
      image: isImage ? content : '',
      sender: currentUser.uid,
      timestamp: new Date().toISOString(),
      seenBy: { [currentUser.uid]: true }
    });
    setInput('');
  };

  useEffect(() => {
    const ref = firebase.database().ref(`GroupMessages/${groupId}`);
    ref.on('value', snapshot => {
      const data = snapshot.val() || {};
      const list = Object.entries(data)
        .map(([id, val]) => ({ id, ...val }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setMessages(list);

      const updates = {};
      snapshot.forEach(child => {
        updates[`${child.key}/seenBy/${currentUser.uid}`] = true;
      });
      ref.update(updates);
    });
    return () => ref.off();
  }, [groupId]);

  useEffect(() => {
    const typingRef = firebase.database().ref(`GroupTyping/${groupId}`);
    typingRef.on('value', snapshot => {
      const data = snapshot.val() || {};
      const typingUsers = Object.entries(data)
        .filter(([uid, val]) => uid !== currentUser.uid && val === true)
        .map(([uid]) => usernames[uid] || 'Someone');
      setTypingStatus(typingUsers.length ? `${typingUsers.join(', ')} is typing...` : '');
    });
    return () => typingRef.off();
  }, [usernames]);

  const handleTyping = (text) => {
    setInput(text);
    const typingRef = firebase.database().ref(`GroupTyping/${groupId}/${currentUser.uid}`);
    typingRef.set(text.length > 0);
    setTimeout(() => typingRef.set(false), 3000);
  };

  const formatTime = (iso) => moment(iso).format('HH:mm');
  const formatDate = (iso) => moment(iso).format('YYYY-MM-DD');

  const groupedMessages = messages.reduce((acc, msg) => {
    const date = formatDate(msg.timestamp);
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  const renderItem = ({ item }) => {
    const isMe = item.sender === currentUser.uid;
    return (
      <View style={[
        styles.messageWrapper,
        { alignItems: isMe ? 'flex-end' : 'flex-start' }
      ]}>
        <View style={[
          styles.messageBubble,
          isMe ? styles.me : styles.other
        ]}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={{ width: 150, height: 150, borderRadius: 10 }} />
          ) : (
            <Text style={styles.messageText}>{item.text}</Text>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.time}>
              {usernames[item.sender] || item.sender} • {formatTime(item.timestamp)}
            </Text>
            {isMe && item.seenBy &&
              Object.keys(item.seenBy).length > 1 && (
                <Ionicons name="checkmark-done" size={14} color="blue" style={styles.seenIcon} />
              )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
     <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{groupName}</Text>
      </View>

      {typingStatus ? (
        <Text style={[styles.time, { paddingLeft: 15 }]}>{typingStatus}</Text>
      ) : null}

      <FlatList
        style={styles.chatList}
        data={Object.entries(groupedMessages).flatMap(([date, msgs]) => [
          { type: 'date', date, id: date },
          ...msgs
        ])}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.type === 'date') {
            return (
              <View style={styles.dateHeader}>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
            );
          }
          return renderItem({ item });
        }}
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
        <TouchableOpacity onPress={() => sendMessage(input)} style={styles.sendButton}>
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  sendButton: {
    backgroundColor: '#007aff',
    borderRadius: 20,
    padding: 10,
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
    marginTop: 4,
  },
  seenIcon: {
    marginLeft: 6,
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
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#f2cdff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
