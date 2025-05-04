import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform,Button, FlatList } from 'react-native';
import React, { useState } from 'react';
import globalStyles from '../assets/styles/globalStyles';

import { ref, set } from "firebase/database"; // You can add logic to send messages here
import firebase from "../Config";
const database = firebase.database();

const ref_listDisscussion = database.ref().child("ListDisscussion");
const Chat = (props) => {
  const currentid = props.route.params.currentUserid;
  const secondid = props.route.params.secondUserid;
const discussionId=currentid>secondid?currentid+secondid:secondid+currentid;

  const [message, setMessage] = useState();



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
        }}
      ></FlatList>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tape ton message..."
          value={message}
          onChangeText={setMessage}
        />
  
        <Button   color={"green"} title='Send' onPress={()=>{const ref_dis=ref_listDisscussion.child(discussionId);
          const ref_messages=ref_dis.child("messages");
          const key=ref_messages.push().key;
        const ref_unmsg=ref_messages.child(key);
        set(ref_unmsg, {
          body: message,
          senderId: currentid,
          recieverId: secondid,
          time: new Date().toLocaleString(),
        })   .then(() => {
        console.log("Message envoyé !");
        setMessage(""); // Clear input after sending
      })
      .catch((error) => {
        console.error("Erreur lors de l'envoi du message :", error);
      });
        }} ></Button>

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
  sendButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
