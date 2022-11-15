import React from 'react';
import {Pressable, StyleProp, StyleSheet, ViewStyle} from 'react-native';

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backgroundColor: '#00000040',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

interface ModalProps {
  children: React.ReactNode;
  onClose?: () => void;
  open: boolean;
  style?: StyleProp<ViewStyle>;
}

const Modal = ({children, onClose, open, style = {}}: ModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <Pressable onPress={onClose} style={[styles.modal, style]}>
      {children}
    </Pressable>
  );
};

export default Modal;
