import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { getDatabase, ref, onValue, push, set, update, serverTimestamp } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../Config';

const GroupChat = ({ route }) => {
  const { groupId, currentUserId } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState({});
  const [isTypingUsers, setIsTypingUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  const groupMessagesRef = ref(db, `groups/${groupId}/messages`);
  const usersRef = ref(db, 'users');
  const typingRef = ref(db, `groups/${groupId}/typing`);

  useEffect(() => {
    const unsubscribeMessages = onValue(groupMessagesRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .sort((a, b) => a.timestamp - b.timestamp);
        setMessages(formatted);
      } else {
        setMessages([]);
      }
    });

    const unsubscribeUsers = onValue(usersRef, snapshot => {
      const data = snapshot.val();
      if (data) setUsers(data);
    });

    const unsubscribeTyping = onValue(typingRef, snapshot => {
      const data = snapshot.val() || {};
      const otherTyping = Object.entries(data)
        .filter(([uid]) => uid !== currentUserId && data[uid])
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
      setIsTypingUsers(otherTyping);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeUsers();
      unsubscribeTyping();
    };
  }, []);

  const handleTyping = text => {
    setMessage(text);
    update(ref(db, `groups/${groupId}/typing`), { [currentUserId]: text.length > 0 });
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    const newMessageRef = push(groupMessagesRef);
    await set(newMessageRef, {
      senderId: currentUserId,
      text: message,
      timestamp: Date.now(),
      seenBy: [currentUserId],
    });
    setMessage('');
    update(ref(db, `groups/${groupId}/typing`), { [currentUserId]: false });
  };

  const sendImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.didCancel || !result.assets?.length) return;

    const image = result.assets[0];
    const storage = getStorage();
    const imageRef = storageRef(storage, `groupChats/${groupId}/${Date.now()}_${image.fileName}`);
    const img = await fetch(image.uri);
    const blob = await img.blob();

    setLoading(true);
    await uploadBytes(imageRef, blob);
    const imageUrl = await getDownloadURL(imageRef);

    const newMessageRef = push(groupMessagesRef);
    await set(newMessageRef, {
      senderId: currentUserId,
      imageUrl,
      timestamp: Date.now(),
      seenBy: [currentUserId],
    });
    setLoading(false);
  };

  const markAsSeen = () => {
    messages.forEach(msg => {
      if (!msg.seenBy?.includes(currentUserId)) {
        const msgRef = ref(db, `groups/${groupId}/messages/${msg.id}/seenBy`);
        update(ref(db, `groups/${groupId}/messages/${msg.id}`), {
          seenBy: [...(msg.seenBy || []), currentUserId],
        });
      }
    });
  };

  useEffect(() => {
    markAsSeen();
  }, [messages]);

  const renderMessages = () => {
    let lastDate = '';
    return messages.map((msg, index) => {
      const isCurrentUser = msg.senderId === currentUserId;
      const senderName = users[msg.senderId]?.name || 'Unknown';
      const msgDate = moment(msg.timestamp).format('LL');

      const showDate = msgDate !== lastDate;
      lastDate = msgDate;

      return (
        <View key={msg.id}>
          {showDate && (
            <Text style={{ alignSelf: 'center', marginVertical: 5, color: '#888' }}>
              {msgDate}
            </Text>
          )}
          <View
            style={{
              alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
              backgroundColor: isCurrentUser ? '#DCF8C5' : '#ECECEC',
              borderRadius: 12,
              padding: 8,
              marginVertical: 4,
              marginHorizontal: 10,
              maxWidth: '75%',
            }}
          >
            {!isCurrentUser && (
              <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>{senderName}</Text>
            )}
            {msg.text && <Text>{msg.text}</Text>}
            {msg.imageUrl && (
              <Image
                source={{ uri: msg.imageUrl }}
                style={{ width: 200, height: 200, borderRadius: 8, marginTop: 5 }}
              />
            )}
            <Text style={{ fontSize: 10, color: '#666', marginTop: 3, alignSelf: 'flex-end' }}>
              {moment(msg.timestamp).format('h:mm A')}
              {isCurrentUser && msg.seenBy?.length > 1 ? ' ✓✓' : ''}
            </Text>
          </View>
        </View>
      );
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ paddingVertical: 10 }}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {renderMessages()}
        {Object.keys(isTypingUsers).length > 0 && (
          <Text style={{ margin: 10, fontStyle: 'italic', color: 'gray' }}>
            {Object.keys(isTypingUsers).map(id => users[id]?.name || 'Someone').join(', ')} typing...
          </Text>
        )}
      </ScrollView>

      {loading && <ActivityIndicator size="small" color="#000" style={{ margin: 5 }} />}

      <View style={{ flexDirection: 'row', padding: 8, alignItems: 'center' }}>
        <TouchableOpacity onPress={sendImage} style={{ marginRight: 5 }}>
          <Ionicons name="image" size={26} color="#007AFF" />
        </TouchableOpacity>
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
            marginRight: 5,
          }}
          value={message}
          placeholder="Type a message"
          onChangeText={handleTyping}
        />
        <TouchableOpacity onPress={sendMessage}>
          <Ionicons name="send" size={26} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default GroupChat;

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
