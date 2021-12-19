import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';

import scale from '../../common/Scale';

import {Button, Header} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import {getBottomSpace, isIphoneX} from 'react-native-iphone-x-helper';
import BannerImage from '../common/BannerImage';

const SignUpDone = props => {
  return (
    <View style={{...styles.container}}>
      <Header
        backgroundColor="transparent"
        statusBarProps={{translucent: true, backgroundColor: 'transparent', barStyle: 'dark-content', animated: true}}
        leftComponent={{
          icon: 'ios-close',
          type: 'ionicon',
          size: scale(25),
          onPress: () => props.navigation.goBack(null),
        }}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <FastImage
          source={require('../../../assets/images/drawable-xxxhdpi/rhc_logo.png')}
          style={{width: scale(148), height: scale(65.2)}}
        />
        <Text style={{...styles.txtLabel}}>서비스 가입 완료</Text>
        <Text style={{...styles.txtSubLabel}}>회원님의 가입이 성공적으로 완료되었습니다.</Text>
        <Text style={{...styles.txtSubLabel}}>RSBC 무료체험에 오신 것을 환영합니다!</Text>
      </SafeAreaView>
      {/* <BannerImage /> */}
      <Button
        title={'서비스 시작하기'}
        titleStyle={{fontSize: scale(17), fontWeight: 'bold', color: 'white'}}
        containerStyle={{borderRadius: 0}}
        buttonStyle={{
          borderRadius: 0,
          paddingBottom: isIphoneX() ? getBottomSpace() : scale(20),
          paddingTop: scale(20),
          backgroundColor: 'black',
        }}
        onPress={() => props.navigation.goBack(null)}
      />
    </View>
  );
};

export default SignUpDone;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtLabel: {
    fontSize: scale(28),
    fontWeight: 'bold',
    color: '#222222',
    marginTop: scale(30),
    marginBottom: scale(10),
  },
  txtSubLabel: {
    fontSize: scale(13),
  },
});
