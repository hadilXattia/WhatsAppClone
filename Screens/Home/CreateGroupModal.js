// screens/Home/CreateGroupModal.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, Modal, TextInput, Button, FlatList, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import firebase from '../../Config';

export default function CreateGroupModal({ visible, onClose }) {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (visible) {
      const userRef = firebase.database().ref('ListAccounts');
      userRef.once('value', snapshot => {
        const data = snapshot.val() || {};
        const userList = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        setUsers(userList);
      });
    }
  }, [visible]);

  const toggleUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true });
    if (!result.cancelled) setImage(result.assets?.[0]?.uri || result.uri);
  };

  const createGroup = () => {
    if (!groupName || selectedUsers.length === 0) return;

    const groupRef = firebase.database().ref('Groups').push();
    groupRef.set({
      name: groupName,
      members: selectedUsers,
      image: image || null,
      createdAt: new Date().toISOString(),
    });

    setGroupName('');
    setSelectedUsers([]);
    setImage(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Create Group</Text>
        <TextInput
          placeholder="Group Name"
          value={groupName}
          onChangeText={setGroupName}
          style={styles.input}
        />
        <Button title="Pick Group Image" onPress={pickImage} />
        {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

        <Text style={styles.subTitle}>Select Members:</Text>
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => toggleUser(item.id)}
              style={[
                styles.userItem,
                selectedUsers.includes(item.id) && styles.selected,
              ]}
            >
              <Text>{item.name} {item.LastName}</Text>
            </TouchableOpacity>
          )}
        />

        <View style={styles.buttonRow}>
          <Button title="Cancel" onPress={onClose} />
          <Button title="Create" onPress={createGroup} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, marginBottom: 15,
  },
  subTitle: { fontWeight: '600', marginTop: 20, marginBottom: 10 },
  imagePreview: {
    width: '100%', height: 200, borderRadius: 10, marginTop: 10, marginBottom: 20,
  },
  userItem: {
    padding: 10, borderBottomWidth: 1, borderColor: '#eee',
  },
  selected: {
    backgroundColor: '#dcdcdc',
  },
  buttonRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 20,
  },
});
