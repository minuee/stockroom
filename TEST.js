import React, {useMemo, useRef} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';

import {BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider} from '@gorhom/bottom-sheet';

const TEST = () => {
  const refBottomSheetModal = useRef(null);
  const snapPoints = useMemo(() => ['18%'], []);

  return (
    <BottomSheetModalProvider>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Button
          title="PRESS"
          onPress={() => {
            refBottomSheetModal.current?.present();
          }}
        />
        <BottomSheetModal
          ref={refBottomSheetModal}
          index={0}
          snapPoints={snapPoints}
          backdropComponent={backdropProps => <BottomSheetBackdrop {...backdropProps} />}>
          <View>
            <Text>OPEND</Text>
          </View>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

export default TEST;

const styles = StyleSheet.create({});
