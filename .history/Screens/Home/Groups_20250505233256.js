// screens/Home/Groups.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CreateGroupModal from './CreateGroupModal';
import firebase from '../../Config';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const groupsRef = firebase.database().ref('Groups');
    groupsRef.on('value', snapshot => {
      const data = snapshot.val() || {};
      const groupList = Object.entries(data).map(([id, val]) => ({ id, ...val }));
      setGroups(groupList);
    });

    return () => groupsRef.off();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Group List</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={30} color="#6200EE" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.groupItem}>
            <Text style={styles.groupName}>{item.name}</Text>
          </View>
        )}
      />

      <CreateGroupModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  groupItem: {
    padding: 15,
    backgroundColor: '#f2f2f2',
    marginBottom: 10,
    borderRadius: 10,
  },
  groupName: { fontSize: 16 },
});
