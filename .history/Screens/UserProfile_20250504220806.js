import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import firebase from '../Config';

const UserProfile = ({ route }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userRef = firebase.database().ref(`ListAccounts/${userId}`);
    userRef.on('value', (snapshot) => {
      setUser(snapshot.val());
    });

    return () => userRef.off();
  }, [userId]);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name: {user.name}</Text>
      <Text style={styles.label}>Lastname: {user.lastname}</Text>
      <Text style={styles.label}>Age: {user.age}</Text>
      <Text style={styles.label}>Phone: {user.phone}</Text>
    </View>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginVertical: 10,
  },
});
