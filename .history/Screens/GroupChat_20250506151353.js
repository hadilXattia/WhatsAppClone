import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { getDatabase, ref, onValue, push, set, serverTimestamp, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageAsync } from '../utils/imageUpload'; // Your helper function
import { database } from '../Config';

const GroupChat = ({ route }) => {
  const { groupId, groupName } = route.params;
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [typingStatus, setTypingStatus] = useState('');
  const flatListRef = useRef();

  useEffect(() => {
    const groupRef = ref(database, `groupMessages/${groupId}`);
    onValue(groupRef, (snapshot) => {
      const data = snapshot.val();
      const messageList = [];
      for (let key in data) {
        messageList.push({ id: key, ...data[key] });
      }
      messageList.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(messageList);

      // Mark messages as seen
      messageList.forEach((msg) => {
        if (!msg.seenBy || !msg.seenBy[currentUser.uid]) {
          const seenRef = ref(database, `groupMessages/${groupId}/${msg.id}/seenBy`);
          update(seenRef, {
            [currentUser.uid]: true,
          });
        }
      });
    });

    const typingRef = ref(database, `groupTyping/${groupId}`);
    onValue(typingRef, (snapshot) => {
      const data = snapshot.val();
      const typingUsers = Object.entries(data || {}).filter(([uid, isTyping]) => uid !== currentUser.uid && isTyping);
      if (typingUsers.length > 0) {
        const names = typingUsers.map(([uid]) => usernames[uid] || 'Someone').join(', ');
        setTypingStatus(`${names} is typing...`);
      } else {
        setTypingStatus('');
      }
    });

    const usersRef = ref(database, 'users');
    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      const nameMap = {};
      for (let key in usersData) {
        nameMap[key] = usersData[key].name;
      }
      setUsernames(nameMap);
    });
  }, [groupId]);

  const sendMessage = async () => {
    if (message.trim() === '') return;
    const messageData = {
      text: message,
      sender: currentUser.uid,
      timestamp: Date.now(),
      seenBy: { [currentUser.uid]: true },
    };
    await push(ref(database, `groupMessages/${groupId}`), messageData);
    setMessage('');
    setTyping(false);
  };

  const setTyping = (typing) => {
    const typingRef = ref(database, `groupTyping/${groupId}/${currentUser.uid}`);
    set(typingRef, typing);
  };

  const handleTyping = (text) => {
    setMessage(text);
    setTyping(true);
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      setTyping(false);
    }, 2000);
  };

  let typingTimeout;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const imageUrl = await uploadImageAsync(result.assets[0].uri);
      const messageData = {
        image: imageUrl,
        sender: currentUser.uid,
        timestamp: Date.now(),
        seenBy: { [currentUser.uid]: true },
      };
      await push(ref(database, `groupMessages/${groupId}`), messageData);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toDateString();
  };

  const renderItem = ({ item, index }) => {
    const isMe = item.sender === currentUser.uid;
    const showDate =
      index === 0 ||
      formatDate(messages[index].timestamp) !==
        formatDate(messages[index - 1].timestamp);

    return (
      <>
        {showDate && (
          <Text style={styles.dateSeparator}>{formatDate(item.timestamp)}</Text>
        )}
        <View
          style={[
            styles.messageWrapper,
            { alignItems: isMe ? 'flex-end' : 'flex-start' },
          ]}
        >
          <View style={[styles.messageBubble, isMe ? styles.me : styles.other]}>
            {!isMe && (
              <Text style={styles.senderName}>
                {usernames[item.sender] || 'User'}
              </Text>
            )}
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.image} />
            ) : (
              <Text style={styles.messageText}>{item.text}</Text>
            )}
            <View style={styles.metaRow}>
              <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
              {isMe && item.seenBy && Object.keys(item.seenBy).length > 1 && (
                <Ionicons
                  name="checkmark-done"
                  size={14}
                  color="blue"
                  style={styles.seenIcon}
                />
              )}
            </View>
          </View>
        </View>
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="people-circle" size={40} color="#555" style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.headerTitle}>{groupName}</Text>
            {typingStatus ? (
              <Text style={{ fontSize: 12, color: 'purple' }}>{typingStatus}</Text>
            ) : (
              <Text style={{ fontSize: 12, color: 'gray' }}>Group chat</Text>
            )}
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
        onContentSizeChange={() =>
          flatListRef.current.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={pickImage}>
          <MaterialIcons name="photo" size={28} color="#555" style={{ marginRight: 10 }} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={handleTyping}
          placeholder="Type a message..."
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default GroupChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageWrapper: {
    marginVertical: 5,
    maxWidth: '80%',
    alignSelf: 'stretch',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 2,
  },
  me: {
    backgroundColor: '#007aff',
    borderTopRightRadius: 0,
  },
  other: {
    backgroundColor: '#e5e5ea',
    borderTopLeftRadius: 0,
  },
  messageText: {
    color: '#000',
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  time: {
    fontSize: 10,
    color: '#666',
  },
  seenIcon: {
    marginLeft: 5,
  },
  dateSeparator: {
    alignSelf: 'center',
    backgroundColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    marginVertical: 10,
    fontSize: 12,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderTopColor: '#ddd',
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007aff',
    padding: 10,
    borderRadius: 20,
  },
  image: {
    width: 160,
    height: 160,
    borderRadius: 10,
    marginTop: 5,
  },
});
