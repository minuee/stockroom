import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';

import scale from '../../common/Scale';

import {Header} from 'react-native-elements';
import {WebView} from 'react-native-webview';

const LinkingDetail = props => {
  return (
    <View style={{...styles.container}}>
      <Header
        backgroundColor="transparent"
        statusBarProps={{translucent: true, backgroundColor: 'transparent', barStyle: 'dark-content', animated: true}}
        leftComponent={{
          icon: 'ios-chevron-back',
          type: 'ionicon',
          size: scale(40),
          color: 'black',
          onPress: () => props.navigation.goBack(null),
        }}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <WebView source={{uri: props.route.params.linkingUrl}} style={{flex: 1}} />
      </SafeAreaView>
    </View>
  );
};

export default LinkingDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
});
