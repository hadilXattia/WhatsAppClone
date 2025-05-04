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

import { ref, set, onValue, off, update } from 'firebase/database';
import firebase from '../Config';
const database = firebase.database();
const ref_listDisscussion = database.ref().child('ListDisscussion');

const Chat = (props) => {
  const currentid = props.route?.params?.currentid;
  const secondid = props.route?.params?.secondid;

  // Early return if one of the IDs is missing
  if (!currentid || !secondid) {
    return (
      <View style={globalStyles.container}>
        <Text>Error: Missing user ID(s).</Text>
      </View>
    );
  }

  const discussionId =
    currentid > secondid ? currentid + secondid : secondid + currentid;

  const [messages, setMessages] = useState([]);
  const [msg, setmsg] = useState('');

  const ref_lesMessages = ref_listDisscussion
    .child(discussionId)
    .child('messages');

  useEffect(() => {
    const listener = onValue(ref_lesMessages, (snapshot) => {
      const d = [];
      snapshot.forEach((un_msg) => {
        const val = un_msg.val();
        d.push({ ...val, key: un_msg.key });
      });
      setMessages(d);
    });

    return () => off(ref_lesMessages);
  }, []);

  const sendMessage = () => {
    if (!msg.trim()) return;

    const key = ref_lesMessages.push().key;
    const ref_unmsg = ref_lesMessages.child(key);

    const messageData = {
      body: msg,
      senderId: currentid,
      recieverId: secondid,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      seen: false,
    };

    set(ref_unmsg, messageData)
      .then(() => {
        console.log('Message envoyé !');
        setmsg('');
      })
      .catch((error) => {
        console.error("Erreur d'envoi :", error);
      });
  };

  // Mark messages as seen if they are for the current user
  useEffect(() => {
    const markAsSeen = () => {
      messages.forEach((m) => {
        if (m.recieverId === currentid && !m.seen) {
          const msgRef = ref_lesMessages.child(m.key);
          update(msgRef, { seen: true });
        }
      });
    };
    markAsSeen();
  }, [messages]);

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
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const isMe = item.senderId === currentid;
            return (
              <View
                style={[
                  styles.messageBubble,
                  isMe ? styles.me : styles.other,
                ]}
              >
                <Text style={styles.messageText}>{item.body}</Text>
                <Text style={styles.time}>
                  {item.time}
                  {isMe && item.seen ? ' ✔✔' : ''}
                </Text>
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
          <Button color="green" title="Send" onPress={sendMessage} />
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
    marginTop: 5,
    textAlign: 'right',
  },
});
