import { StatusBar } from "expo-status-bar";
import {
  Button,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import firebase from "../Config";
import { useState } from "react";
const auth = firebase.auth();


export default function NewUser(props) {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setconfirmPassword] = useState();
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
          Create acount
        </Text>
        <TextInput
          onChangeText={(ch) => setEmail(ch)}
          keyboardType="email-address"
          style={styles.input}
          placeholder="site@gmail.come"
        ></TextInput>
        <TextInput
          style={styles.input}
          placeholder="password"
          onChangeText={(ch) => setPassword(ch)}
        ></TextInput>
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          onChangeText={(ch) => setconfirmPassword(ch)}
        ></TextInput>
        <View style={{ flexDirection: "row", gap: 15 }}>
          <Button
            title="Create"
            color={"gray"}
            onPress={() => {
              if (password === confirmPassword) {
                {
                  auth
                    .createUserWithEmailAndPassword(email, password)
                    .then(() => {
                      const currentUserid = auth.currentUser.uid;
                      alert("User Created");
                      props.navigation.replace("MyAccount",{currentUserid:currentUserid});
                    })
                    .catch((error) => {
                      alert(error.message);
                    });
                }
              } else {
                alert("Password not match");
              }
            }}
          ></Button>
          <Button
            title="Back"
            color={"gray"}
            onPress={() => props.navigation.goBack()}
          ></Button>
        </View>
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
