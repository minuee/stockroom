import React, {useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';

import scale from '../../common/Scale';
import {apiObject} from '../../common/API';
import useAlert from '../../Hooks/useAlert';

import {Header} from 'react-native-elements';

const TOS = props => {
  const alert = useAlert();

  const [dataList, setDataList] = useState('');

  const _getPPnTOS = async () => {
    const apiResult = await apiObject.getPPnTOS({content_type_code_id: 'TERMS'});

    setDataList(apiResult.items[0].content_content);
  };

  useEffect(() => {
    _getPPnTOS();
  }, []);

  return (
    <View style={{...styles.conatiner}}>
      <Header
        backgroundColor="transparent"
        statusBarProps={{translucent: true, backgroundColor: 'transparent', barStyle: 'dark-content', animated: true}}
        leftComponent={{
          icon: 'ios-chevron-back',
          type: 'ionicon',
          size: scale(35),
          color: 'black',
          onPress: () => props.navigation.goBack(null),
        }}
        centerComponent={{text: '이용약관', style: {fontSize: scale(21), fontWeight: 'bold'}}}
        centerContainerStyle={{justifyContent: 'center'}}
        placement="left"
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <ScrollView contentContainerStyle={{paddingHorizontal: scale(15)}}>
          <Text>{dataList}</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default TOS;

const styles = StyleSheet.create({
  conatiner: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
});
