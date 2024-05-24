import React, {ReactNode} from 'react';
import {Modal, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';

interface IPropsWaModal {
  show: boolean;
  onDimiss: () => void;
  children?: ReactNode;
  fullWidth?: boolean;
}

const WaModal = ({
  show,
  children,
  fullWidth = true,
  onDimiss,
}: IPropsWaModal) => {
  const closeModal = () => {
    onDimiss();
  };

  return (
    <View style={styles.container}>
      <Modal
        transparent={true}
        animationType="fade"
        visible={show}
        onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalContainer}>
            <View
              style={{
                width: fullWidth ? '95%' : '75%',
                borderRadius: 8,
                padding: 12,
              }}>
              {children}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default WaModal;
