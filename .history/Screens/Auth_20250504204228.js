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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ImageBackground
      source={require("../assets/back.jpg")}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome</Text>

        <TextInput
          keyboardType="email-address"
          style={styles.input}
          placeholder="site@gmail.com"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.buttonRow}>
          <Button
            title="Submit"
            color="gray"
            onPress={() => {
              if (!email || !password) {
                alert("Please enter both email and password.");
                return;
              }

              auth
                .signInWithEmailAndPassword(email, password)
                .then(() => {
                  const currentUserid = auth.currentUser.uid;
                  props.navigation.navigate("Home", { currentUserid });
                })
                .catch((error) => {
                  const msg =
                    error.code === "auth/user-not-found"
                      ? "No user found with that email."
                      : error.code === "auth/wrong-password"
                      ? "Incorrect password."
                      : "Authentication error.";
                  alert(msg);
                });
            }}
          />

          <Button
            title="Exit"
            color="gray"
            onPress={() => BackHandler.exitApp()}
          />
        </View>

        <Text
          style={styles.register}
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
  formContainer: {
    alignItems: "center",
    width: "95%",
    backgroundColor: "#0002",
    borderRadius: 20,
    padding: 20,
    margin: 20,
  },
  title: {
    fontSize: 34,
    fontStyle: "italic",
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
    marginBottom: 20,
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
  buttonRow: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10,
  },
  register: {
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
