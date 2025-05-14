import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { Ionicons } from '@expo/vector-icons';
import { database } from '../firebase';

const Chat = (props) => {
  const [secondUserName, setSecondUserName] = useState('');
  const [secondUserOnline, setSecondUserOnline] = useState(false);
  const [secondUserTyping, setSecondUserTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [msg, setmsg] = useState('');

  const currentid = props.route?.params?.currentid;
  const secondid = props.route?.params?.secondid;
  const discussionId =
    currentid > secondid ? currentid + secondid : secondid + currentid;

  const ref_discussion = database.ref('ListDisscussion').child(discussionId);
  const ref_messages = ref_discussion.child('messages');
  const ref_typing = ref_discussion.child('typing');

  const parseCustomDate = (dateStr) => {
    if (!dateStr) return new Date();
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime())) return isoDate;
    try {
      const [datePart, timePart] = dateStr.split(' ');
      const [day, month, year] = datePart.split('/');
      return new Date(`${year}-${month}-${day}T${timePart}`);
    } catch (err) {
      return new Date();
    }
  };

  useEffect(() => {
    const refSecondUser = firebase.database().ref('ListAccounts').child(secondid);

    const listener = refSecondUser.on('value', (snapshot) => {
      const userData = snapshot.val();
      if (userData) {
        setSecondUserName(userData.name || '');
        const lastOnline = userData.lastOnline;
        const now = Date.now();
        const isOnline = lastOnline && now - lastOnline < 2 * 60 * 1000;
        setSecondUserOnline(isOnline);
      }
    });

    const typingListener = ref_typing.child(secondid).on('value', (snapshot) => {
      setSecondUserTyping(snapshot.val() === true);
    });

    return () => {
      refSecondUser.off('value', listener);
      ref_typing.child(secondid).off('value', typingListener);
    };
  }, [secondid]);

  useEffect(() => {
    const listener = ref_messages.on('value', (snapshot) => {
      const rawMessages = [];
      snapshot.forEach((un_msg) => {
        const msgData = un_msg.val();
        rawMessages.push({ ...msgData, key: un_msg.key });
      });

      rawMessages.sort((a, b) => parseCustomDate(a.time) - parseCustomDate(b.time));

      const updates = {};
      rawMessages.forEach((msg) => {
        if (msg.recieverId === currentid && !msg.seen && msg.key) {
          updates[msg.key + '/seen'] = true;
        }
      });

      if (Object.keys(updates).length > 0) {
        ref_messages.update(updates).catch((error) =>
          console.error("Failed to update seen statuses:", error)
        );
      }

      const grouped = [];
      let lastDate = null;

      rawMessages.forEach((msg) => {
        const msgDate = parseCustomDate(msg.time);
        const dateString = msgDate.toDateString();

        if (dateString !== lastDate) {
          grouped.push({ type: 'date', date: dateString });
          lastDate = dateString;
        }

        grouped.push({ ...msg, type: 'message' });
      });

      setMessages(grouped);
    });

    return () => {
      ref_messages.off('value', listener);
    };
  }, []);

  const sendMessage = (content) => {
    const key = ref_messages.push().key;
    const ref_unmsg = ref_messages.child(key);
    const now = new Date();
    const formattedTime = now.toISOString();

    set(ref_unmsg, {
      body: content,
      senderId: currentid,
      recieverId: secondid,
      time: formattedTime,
      seen: false,
    })
      .then(() => {
        setmsg('');
        ref_typing.child(currentid).set(false);
      })
      .catch((error) => {
        console.error("Erreur lors de l'envoi du message :", error);
      });
  };

  const handleSend = () => {
    if (msg.trim() !== '') {
      sendMessage(msg);
    }
  };

  const handleTypingChange = (text) => {
    setmsg(text);
    ref_typing.child(currentid).set(text.length > 0);
  };

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

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {secondUserName || 'Chat'}{' '}
            <Text style={{ fontSize: 12, color: secondUserOnline ? 'green' : 'gray' }}>
              ({secondUserTyping ? 'typing...' : secondUserOnline ? 'online' : 'offline'})
            </Text>
          </Text>
          <TouchableOpacity
            onPress={() =>
              props.navigation.navigate('UserProfile', { userId: secondid })
            }
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <FlatList
          style={styles.chatList}
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
            if (item.type === 'date') {
              return (
                <View style={styles.dateHeader}>
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
              );
            }

            const isMe = item.senderId === currentid;
            const timeOnly = parseCustomDate(item.time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            const isLastMyMessage =
              isMe &&
              index ===
                messages
                  .map((m, i) => (m.type === 'message' && m.senderId === currentid ? i : null))
                  .filter((i) => i !== null)
                  .pop();

            return (
              <View
                style={[
                  styles.messageWrapper,
                  { alignItems: isMe ? 'flex-end' : 'flex-start' },
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isMe ? styles.me : styles.other,
                  ]}
                >
                  {item.body.startsWith('data:image') ? (
                    <Image
                      source={{ uri: item.body }}
                      style={{ width: 200, height: 200, borderRadius: 10 }}
                    />
                  ) : (
                    <Text style={styles.messageText}>{item.body}</Text>
                  )}
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.time}>{timeOnly}</Text>
                  {isMe && isLastMyMessage && (
                    <Ionicons
                      name={item.seen ? 'checkmark-done' : 'checkmark'}
                      size={16}
                      color={item.seen ? 'blue' : 'red'}
                      style={styles.seenIcon}
                    />
                  )}
                </View>
              </View>
            );
          }}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={pickImage} style={{ marginRight: 10 }}>
            <Ionicons name="image-outline" size={26} color="green" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Tape ton message..."
            value={msg}
            onChangeText={handleTypingChange}
          />
          <Button color={'green'} title="Send" onPress={handleSend} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, paddingTop: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  chatList: { flex: 1, paddingHorizontal: 10 },
  messageWrapper: { marginVertical: 5 },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    maxWidth: '75%',
  },
  me: { backgroundColor: '#dcf8c6' },
  other: { backgroundColor: '#f1f0f0' },
  messageText: { fontSize: 16 },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  time: { fontSize: 12, color: '#666', marginTop: 2 },
  seenIcon: { marginLeft: 5, marginTop: 2 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: 10,
  },
  dateText: {
    fontSize: 13,
    color: '#888',
    backgroundColor: '#eee',
    padding: 5,
    borderRadius: 10,
  },
});
