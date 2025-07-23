import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const Footer = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Created by Utkarsh Dixit</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '400',
  },
});

export default Footer;
