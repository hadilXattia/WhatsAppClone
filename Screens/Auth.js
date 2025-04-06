import { StatusBar } from "expo-status-bar";
import {
  BackHandler,
  Button,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import firebase from "../Config";
const auth = firebase.auth();
import { useState } from "react";
export default function Auth(props) {
  const [email, setEmail] = useState("hadil@gmail.com");
  const [password, setPassword] = useState("Test123");

  return (
    <ImageBackground
      source={require("../assets/back.jpg")}
      style={styles.container}
    >
      <View
        style={{
          alignItems: "center",
          alignContent: "center",
          width: "95%",
          backgroundColor: "#0002",
          borderRadius: 20,
          padding: "20",
          margin: "20",
        }}
      >
        <Text
          style={{
            fontSize: 34,
            fontStyle: "italic",
            fontWeight: "bold",
            textAlign: "center",
            color: "white",
          }}
        >
          Welcome
        </Text>
        <TextInput
          keyboardType="email-address"
          style={styles.input}
          placeholder="site@gmail.come"
        ></TextInput>
        <TextInput style={styles.input} placeholder="password"></TextInput>
        <View style={{ flexDirection: "row", gap: 15 }}>
          <Button
            title="submit"
            color={"gray"}
            onPress={() => {
              auth
                .signInWithEmailAndPassword(email, password)
                .then(() => {
                  const currentUserid = auth.currentUser.uid;
                  props.navigation.navigate("Home",{currentUserid:currentUserid});
                })
                .catch((error) => {
                  alert(error.message);
                });
            }}
          ></Button>
          <Button
            title="Exit"
            color={"gray"}
            onPress={BackHandler.exitApp()}
          ></Button>
        </View>
        <Text
          style={styles.Register}
          onPress={() => {
            props.navigation.navigate("NewUser");
          }}
        >
          Create new account
        </Text>
      </View>
      <StatusBar style="auto" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "yellow",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: "95%",
    height: 50,
    backgroundColor: "#fff5",
    margin: 15,
    padding: 8,
    border: 1,
    borderColor: "#000",
    borderRadius: 10,
    textAlign: "center",
  },
  Register: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    fontStyle: "italic",
    textAlign: "right",
    textDecorationLine: "underline",
    marginTop: 10,
    width: "100%",
  },
});
