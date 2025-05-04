import {StyleSheet, Text, View, TextInput, KeyboardAvoidingView,
Platform, Button, FlatList
} from 'react-native';
import React, { useEffect, useState } from 'react';
import globalStyles from '../assets/styles/globalStyles';

import { ref, set } from "firebase/database";
import firebase from "../Config";
const database = firebase.database();
const ref_listDisscussion = database.ref().child("ListDisscussion");

const Chat = (props) => {
const currentid = props.route?.params?.currentid;
const secondid = props.route?.params?.secondid;
const discussionId = currentid > secondid ? currentid + secondid : secondid + currentid;

const [messages, setMessages] = useState([]);
const [msg, setmsg] = useState("");

const ref_lesMessages = ref_listDisscussion.child(discussionId).child("messages");

useEffect(() => {
  ref_lesMessages.on("value", (snapshot) => {
    const d = [];
    snapshot.forEach((un_msg) => {
      d.push(un_msg.val());
    });
    setMessages(d); // ✅ Update state with messages
  });

  return () => {
    ref_lesMessages.off();
  };
}, []);

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
          backgroundColor: "#0001",
          width: "100%",
          marginBottom: 70, // Make space for input field
        }}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          const isMe = item.senderId === currentid;
          return (
            <View style={[styles.messageBubble, isMe ? styles.me : styles.other]}>
              <Text style={styles.messageText}>{item.body}</Text>
              <Text style={styles.time}>{item.time}</Text>
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

        <Button
          color={"green"}
          title='Send'
          onPress={() => {
            const ref_dis = ref_listDisscussion.child(discussionId);
            const ref_messages = ref_dis.child("messages");
            const key = ref_messages.push().key;
            const ref_unmsg = ref_messages.child(key);
            set(ref_unmsg, {
              body: msg,
              senderId: currentid,
              recieverId: secondid,
              time: new Date().toLocaleString(),
            })
              .then(() => {
                console.log("Message envoyé !");
                setmsg(""); // ✅ Clear input field
              })
              .catch((error) => {
                console.error("Erreur lors de l'envoi du message :", error);
              });
          }}
        />
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