import {
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Button,
  FlatList,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import globalStyles from '../assets/styles/globalStyles';
import { ref, set } from 'firebase/database';
import firebase from '../Config';

const database = firebase.database();
const ref_listDisscussion = database.ref().child('ListDisscussion');

const Chat = (props) => {
  const currentid = props.route?.params?.currentid;
  const secondid = props.route?.params?.secondid;
  const discussionId =
    currentid > secondid ? currentid + secondid : secondid + currentid;

  const [messages, setMessages] = useState([]);
  const [msg, setmsg] = useState('');

  const ref_lesMessages = ref_listDisscussion
    .child(discussionId)
    .child('messages');

  const parseCustomDate = (dateStr) => {
    try {
      const [datePart, timePart] = dateStr.split(' ');
      const [day, month, year] = datePart.split('/');
      return new Date(`${year}-${month}-${day}T${timePart}`);
    } catch (err) {
      return new Date();
    }
  };

  useEffect(() => {
    const listener = ref_lesMessages.on('value', (snapshot) => {
      const rawMessages = [];
      snapshot.forEach((un_msg) => {
        const msgData = un_msg.val();
        rawMessages.push({ ...msgData, key: un_msg.key });
      });

      rawMessages.sort(
        (a, b) => parseCustomDate(a.time) - parseCustomDate(b.time)
      );

      rawMessages.forEach((msg) => {
        if (msg.recieverId === currentid && !msg.seen) {
          const msgRef = ref_lesMessages.child(msg.key);
          set(msgRef, { ...msg, seen: true });
        }
      });

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
      ref_lesMessages.off('value', listener);
    };
  }, []);

  const handleSend = () => {
    const ref_dis = ref_listDisscussion.child(discussionId);
    const ref_messages = ref_dis.child('messages');
    const key = ref_messages.push().key;
    const ref_unmsg = ref_messages.child(key);

    const now = new Date();
    const formattedTime = now
      .toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace(',', '');

    set(ref_unmsg, {
      body: msg,
      senderId: currentid,
      recieverId: secondid,
      time: formattedTime,
      seen: false,
    })
      .then(() => {
        setmsg('');
      })
      .catch((error) => {
        console.error("Erreur lors de l'envoi du message :", error);
      });
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={globalStyles.container}>
        <View style={globalStyles.titleContainer}>
          <Text style={globalStyles.widgetTitle}>Chat</Text>
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
                  <Text style={styles.messageText}>{item.body}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.time}>{timeOnly}</Text>
                  {isMe && isLastMyMessage && (
                    <Ionicons
                      name={item.seen ? 'checkmark-done' : 'checkmark'}
                      size={16}
                      color={item.seen ? 'blue' : 'gray'}
                      style={styles.seenIcon}
                    />
                  )}
                </View>
              </View>
            );
          }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tape ton message..."
            value={msg}
            onChangeText={setmsg}
          />
          <Button color={'green'} title="Send" onPress={handleSend} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Chat;

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
});
