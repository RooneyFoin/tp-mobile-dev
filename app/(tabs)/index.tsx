import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const TicketItem = ({ ticket, onEdit, onDelete, onRate }) => (
  <View style={styles.card}>
    <View style={styles.row}>
      <Text style={styles.title}>{ticket.title}</Text>
      <View style={styles.row}>
        {ticket.status !== 'Completed' && (
          <Pressable onPress={() => onEdit(ticket)} style={styles.editBtn}>
            <Text style={styles.btnText}>Edit</Text>
          </Pressable>
        )}
        <Pressable onPress={() => onDelete(ticket.id)} style={styles.deleteBtn}>
          <Text style={styles.btnText}>Delete</Text>
        </Pressable>
      </View>
    </View>
    {ticket.description ? <Text style={styles.desc}>{ticket.description}</Text> : null}
    <Text style={styles.status}>{ticket.status}</Text>
    {ticket.status === 'Completed' && (
      ticket.rating > 0 ? (
        <Text style={styles.rating}>Rating: {ticket.rating}/5</Text>
      ) : (
        <Pressable onPress={() => onRate(ticket.id)}>
          <Text style={styles.link}>Rate this ticket</Text>
        </Pressable>
      )
    )}
  </View>
);

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'Created' });
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [ratingTicketId, setRatingTicketId] = useState(null);

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    if (editingId) {
      setTickets(tickets.map(t => t.id === editingId ? { ...t, ...formData } : t));
    } else {
      setTickets([...tickets, { id: Date.now().toString(), ...formData, rating: 0 }]);
    }
    setFormData({ title: '', description: '', status: 'Created' });
    setModalVisible(false);
    setEditingId(null);
  };

  const handleEdit = (ticket) => {
    setFormData({ title: ticket.title, description: ticket.description, status: ticket.status });
    setEditingId(ticket.id);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Ticket', 'Are you sure you want to delete this ticket?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setTickets(tickets.filter(t => t.id !== id)) }
    ]);
  };

  const submitRating = (rating) => {
    setTickets(tickets.map(t => t.id === ratingTicketId ? { ...t, rating } : t));
    setRatingModalVisible(false);
    setRatingTicketId(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Eyang Support Tickets</Text>
      
      <Pressable style={styles.addBtn} onPress={() => {
        setFormData({ title: '', description: '', status: 'Created' });
        setEditingId(null);
        setModalVisible(true);
      }}>
        <Text style={styles.addText}>+ Add Ticket</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>All Tickets</Text>

      <FlatList
        data={tickets}
        renderItem={({ item }) => (
          <TicketItem
            ticket={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRate={(id) => {
              setRatingTicketId(id);
              setRatingModalVisible(true);
            }}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No tickets yet</Text>}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit' : 'New'} Ticket</Text>
            
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={text => setFormData({ ...formData, title: text })}
              placeholder="Title"
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={text => setFormData({ ...formData, description: text })}
              placeholder="Details"
              placeholderTextColor="#999"
              multiline
            />
            
            <View style={styles.statusPicker}>
              {['Created', 'Under Assistance', 'Completed'].map(s => (
                <Pressable
                  key={s}
                  style={({ pressed }) => [
                    styles.statusBtn,
                    formData.status === s && styles.statusBtnActive,
                    pressed && styles.statusBtnPressed
                  ]}
                  onPress={() => setFormData({ ...formData, status: s })}
                >
                  <Text style={[styles.statusText, formData.status === s && styles.statusTextActive]}>{s}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalBtns}>
              <Pressable style={styles.primaryBtn} onPress={handleSubmit}>
                <Text style={styles.primaryText}>{editingId ? 'Update' : 'Create'}</Text>
              </Pressable>
              <Pressable style={styles.secondaryBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.secondaryText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={ratingModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Rate Ticket</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map(number => (
                <Pressable
                  key={number}
                  onPress={() => submitRating(number)}
                  style={({ pressed }) => [
                    styles.ratingBtn,
                    pressed && styles.ratingBtnPressed
                  ]}
                >
                  <Text style={styles.ratingText}>{number}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.secondaryBtn} onPress={() => setRatingModalVisible(false)}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { fontSize: 28, fontWeight: '700', padding: 20, backgroundColor: '#fff', textAlign: 'center' },
  addBtn: { backgroundColor: '#1e3a8a', padding: 16, margin: 15, borderRadius: 8, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  addText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '600', paddingHorizontal: 15, marginBottom: 10, color: '#1e3a8a' },
  list: { padding: 15 },
  card: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '600', flex: 1, color: '#1f2937' },
  editBtn: { backgroundColor: '#1e3a8a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  deleteBtn: { backgroundColor: '#dc2626', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  desc: { fontSize: 14, color: '#6b7280', marginTop: 5 },
  status: { fontSize: 12, color: '#6b7280', marginTop: 10 },
  rating: { fontSize: 14, color: '#1f2937', marginTop: 5 },
  link: { color: '#1e3a8a', textDecorationLine: 'underline', marginTop: 5 },
  empty: { textAlign: 'center', color: '#9ca3af', padding: 40, fontSize: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: { 
    backgroundColor: '#f9fafb', 
    borderRadius: 12, 
    padding: 24, 
    width: '90%', 
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 6 
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    marginBottom: 20, 
    color: '#1e3a8a', 
    textAlign: 'center' 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 12, 
    backgroundColor: '#fff', 
    fontSize: 16, 
    color: '#1f2937' 
  },
  textArea: { 
    height: 120, 
    textAlignVertical: 'top', 
    borderWidth: 2, 
    borderColor: '#14b8a6', 
    backgroundColor: '#f0fdfa', 
    padding: 16, 
    fontSize: 16, 
    fontWeight: '500', 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
  statusPicker: { 
    flexDirection: 'row', 
    gap: 8, 
    marginBottom: 20, 
    flexWrap: 'wrap', 
    justifyContent: 'center' 
  },
  statusBtn: { 
    borderWidth: 2, 
    borderColor: '#d1d5db', 
    borderRadius: 6, 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    alignItems: 'center', 
    flex: 1, 
    minWidth: 90 
  },
  statusBtnActive: { 
    borderColor: '#14b8a6', 
    backgroundColor: '#ccfbf1' 
  },
  statusBtnPressed: { 
    transform: [{ rotate: '2deg' }], 
    backgroundColor: '#e5e7eb' 
  },
  statusText: { 
    fontSize: 13, 
    color: '#1f2937', 
    fontWeight: '500' 
  },
  statusTextActive: { 
    color: '#14b8a6', 
    fontWeight: '700' 
  },
  modalBtns: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 10 
  },
  primaryBtn: { 
    flex: 1, 
    backgroundColor: '#1e3a8a', 
    padding: 14, 
    borderRadius: 8, 
    alignItems: 'center', 
    elevation: 2 
  },
  primaryText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16 
  },
  secondaryBtn: { 
    flex: 1, 
    backgroundColor: '#e5e7eb', 
    padding: 14, 
    borderRadius: 8, 
    alignItems: 'center', 
    elevation: 2 
  },
  secondaryText: { 
    color: '#1f2937', 
    fontWeight: '600', 
    fontSize: 16 
  },
  ratingContainer: { 
    flexDirection: 'row', 
    gap: 10, 
    marginVertical: 20, 
    justifyContent: 'center' 
  },
  ratingBtn: { 
    borderWidth: 2, 
    borderColor: '#14b8a6', 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff' 
  },
  ratingBtnPressed: { 
    transform: [{ scale: 0.9 }], 
    backgroundColor: '#e0f2fe' 
  },
  ratingText: { 
    color: '#14b8a6', 
    fontSize: 18, 
    fontWeight: '700' 
  },
});