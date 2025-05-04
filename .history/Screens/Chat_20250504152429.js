import {
  StyleSheet, Text, View, TextInput, KeyboardAvoidingView,
  Platform, Button, FlatList
} from 'react-native';
import React, { useEffect, useState } from 'react';
import globalStyles from '../assets/styles/globalStyles';

import firebase from "../Config";
const database = firebase.database();
const ref_listDisscussion = database.ref().child("ListDisscussion");

const Chat = (props) => {
  const currentid = props.route?.params?.currentUserid;
  const secondid = props.route?.params?.secondUserid;

  if (!currentid || !secondid) {
    return <Text>Erreur : identifiants manquants.</Text>;
  }

  const discussionId = currentid > secondid ? currentid + secondid : secondid + currentid;

  const [messages, setMessages] = useState([]);
  const [msg, setmsg] = useState("");

  useEffect(() => {
    const ref_lesMessages = ref_listDisscussion.child(discussionId).child("messages");

    const handleNewMessages = (snapshot) => {
      const d = [];
      snapshot.forEach((un_msg) => {
        d.push(un_msg.val());
      });
      setMessages(d);
    };

    ref_lesMessages.on("value", handleNewMessages);

    return () => {
      ref_lesMessages.off("value", handleNewMessages);
    };
  }, [discussionId]);

  const sendMessage = () => {
    if (!msg.trim()) return; // éviter les messages vides

    const ref_dis = ref_listDisscussion.child(discussionId);
    const ref_messages = ref_dis.child("messages");
    const key = ref_messages.push().key;

    const newMessage = {
      body: msg,
      senderId: currentid,
      recieverId: secondid,
      time: new Date().toLocaleString(),
    };

    ref_messages.child(key).set(newMessage)
      .then(() => {
        console.log("Message envoyé !");
        setmsg(""); // vider le champ
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
          style={{ backgroundColor: "#0001", width: "100%" }}
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <Text>{item.body}</Text>}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tape ton message..."
            value={msg}
            onChangeText={setmsg}
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
});
