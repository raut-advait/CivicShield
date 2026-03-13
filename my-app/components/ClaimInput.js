import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { Text } from 'react-native-paper';

/**
 * ClaimInput - A styled text input component for entering claim text.
 */
export default function ClaimInput({ value, onChangeText, editable = true }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Claim to verify</Text>
      <Text style={styles.hint}>Paste a post, headline, or public update you want checked.</Text>
      <TextInput
        style={[styles.input, !editable && styles.disabledInput]}
        multiline
        numberOfLines={5}
        placeholder="Example: The government launched a new subsidy for all students this month."
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Manrope_700Bold',
    color: '#1F2C35',
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Manrope_500Medium',
    color: '#6E766D',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D8DDD3',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    fontFamily: 'Manrope_500Medium',
    color: '#10212B',
    backgroundColor: '#FBFBF8',
    minHeight: 148,
    lineHeight: 22,
  },
  disabledInput: {
    backgroundColor: '#EEF0EC',
    color: '#6E766D',
  },
});
