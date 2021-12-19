import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, View, KeyboardAvoidingView} from 'react-native';
import codePush from 'react-native-code-push';

const Check = props => {
  const [updateInfo, setUpdateInfo] = useState({});

  const onCheck = async () => {
    const [configuration, updateMetadata] = await Promise.all([
      codePush.getConfiguration(),
      codePush.getUpdateMetadata(),
    ]);

    setUpdateInfo({
      ...configuration,
      ...updateMetadata,
    });
  };

  useEffect(() => {
    onCheck();
  }, []);

  return (
    <View style={styles.container}>
      <Text>{`Check version ${updateInfo.appVersion}`}</Text>
      <Text>{`Check label ${updateInfo.label}`}</Text>
      <Text>{`${JSON.stringify(updateInfo, null, 3)}}`}</Text>
      <Text>{'test 210817 1226'}</Text>
    </View>
  );
};

export default Check;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  contents: {
    flex: 1,
  },
  viewInner: {
    // padding: scale(10),
  },
});
