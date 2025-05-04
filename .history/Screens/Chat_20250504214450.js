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
    ref_lesMessages.on('value', (snapshot) => {
      const rawMessages = [];
      snapshot.forEach((un_msg) => {
        const msg = un_msg.val();
        msg.key = un_msg.key = un_msg.key || un_msg.ref.key;
        rawMessages.push(msg);
      });

      rawMessages.sort(
        (a, b) => parseCustomDate(a.time) - parseCustomDate(b.time)
      );

      // Mark last received message as seen
      const unseenMessages = rawMessages.filter(
        (m) => m.recieverId === currentid && !m.seen
      );

      if (unseenMessages.length > 0) {
        const lastUnseen = unseenMessages[unseenMessages.length - 1];
        const ref_seenMsg = ref_lesMessages.child(lastUnseen.key);
        set(ref_seenMsg, { ...lastUnseen, seen: true });
      }

      // Group messages by date
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
      ref_lesMessages.off();
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
          style={{
            backgroundColor: '#0001',
            width: '100%',
            marginBottom: 70,
          }}
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
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

            return (
              <View
                style={[styles.messageBubble, isMe ? styles.me : styles.other]}
              >
                <Text style={styles.messageText}>{item.body}</Text>
                <View style={styles.timeSeenContainer}>
                  <Text style={styles.time}>{timeOnly}</Text>
                  {isMe && item.seen && (
                    <Text style={styles.seenIcon}>✓✓</Text>
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
            onChangeText={(txt) => setmsg(txt)}
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
  messageBubble: {
    margin: 5,
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
  },
  timeSeenContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 5,
  },
  seenIcon: {
    fontSize: 12,
    color: 'blue',
    marginLeft: 5,
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
