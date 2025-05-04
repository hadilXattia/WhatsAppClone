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
  const [email, setEmail] = useState(""); // Email input state
  const [password, setPassword] = useState(""); // Password input state

  return (
    <ImageBackground
      source={require("../assets/back.jpg")}
      style={styles.container}
    >
      <View
        style={{
          alignItems: "center",
          width: "95%",
          backgroundColor: "#0002",
          borderRadius: 20,
          padding: 20,
          margin: 20,
        }}
      >
        <Text style={styles.welcomeText}>Welcome</Text>
        <TextInput
          keyboardType="email-address"
          style={styles.input}
          placeholder="site@gmail.com"
          value={email} // Bind email to state
          onChangeText={(text) => setEmail(text)} // Update state when input changes
        />
        <TextInput
          style={styles.input}
          placeholder="password"
          secureTextEntry
          value={password} // Bind password to state
          onChangeText={(text) => setPassword(text)} // Update state when input changes
        />
        <View style={{ flexDirection: "row", gap: 15 }}>
          <Button
            title="Submit"
            color={"gray"}
            onPress={() => {
              auth
                .signInWithEmailAndPassword(email, password)
                .then(() => {
                  const currentUserid = auth.currentUser.uid;
                  // Pass currentUserid as a parameter to Home screen
                  props.navigation.navigate("Home", { currentUserid: currentUserid, });
                })
                .catch((error) => {
                  alert(error.message);
                });
            }}
          />
          <Button
            title="Exit"
            color={"gray"}
            onPress={() => BackHandler.exitApp()}
          />
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
  welcomeText: {
    fontSize: 34,
    fontStyle: "italic",
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  input: {
    width: "95%",
    height: 50,
    backgroundColor: "#fff5",
    margin: 15,
    padding: 8,
    borderWidth: 1,
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
