import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Button, CheckBox, Divider, Header, Icon} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import {getBottomSpace, isIphoneX} from 'react-native-iphone-x-helper';

import scale from '../../common/Scale';
import useAlert from '../../Hooks/useAlert';
import BannerImage from '../common/BannerImage';

const Consent = props => {
  const alert = useAlert();

  const [isConsent, setIsConsent] = useState({
    isPP: false,
    isToS: false,
    isMarketing: false,
  });

  return (
    <View style={{...styles.container}}>
      <Header
        backgroundColor="transparent"
        statusBarProps={{translucent: true, backgroundColor: 'transparent', barStyle: 'dark-content', animated: true}}
        leftComponent={{
          icon: 'ios-chevron-back',
          type: 'ionicon',
          size: scale(25),
          onPress: () => props.navigation.goBack(null),
        }}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <View style={{...styles.viewInner}}>
          <Text style={{...styles.txtTitle}}>약관동의</Text>
          <CheckBox
            checked={isConsent.isPP && isConsent.isToS && isConsent.isMarketing}
            title="약관에 전체 동의합니다."
            textStyle={{fontSize: scale(18), color: '#222222', fontWeight: 'bold'}}
            iconType="ionicon"
            uncheckedIcon="ios-checkmark-circle"
            uncheckedColor="#e4e4e4"
            checkedIcon="ios-checkmark-circle"
            checkedColor="#c01920"
            containerStyle={{...styles.viewCheckBoxArea}}
            size={scale(25)}
            onPress={() => {
              setIsConsent(prevState => {
                return {
                  isPP: !prevState.isPP,
                  isToS: !prevState.isToS,
                  isMarketing: !prevState.isMarketing,
                };
              });
            }}
          />
          <Divider style={{marginVertical: scale(20)}} />
          <View style={{...styles.viewRowArea}}>
            <CheckBox
              checked={isConsent.isPP}
              title="이용약관 (필수)"
              textStyle={{fontSize: scale(16), color: '#222222', fontWeight: 'normal'}}
              iconType="ionicon"
              uncheckedIcon="ios-checkmark-circle-outline"
              uncheckedColor="#e4e4e4"
              checkedIcon="ios-checkmark-circle-outline"
              checkedColor="#c01920"
              containerStyle={{...styles.viewCheckBoxArea, marginBottom: scale(15), flex: 1}}
              size={scale(25)}
              onPress={() => setIsConsent({...isConsent, isPP: !isConsent.isPP})}
            />
            <TouchableOpacity onPress={() => props.navigation.navigate('TOS')}>
              <Icon
                name="ios-chevron-forward"
                type="ionicon"
                size={scale(25)}
                color="#dddddd"
                style={{marginBottom: scale(15)}}
              />
            </TouchableOpacity>
          </View>
          <View style={{...styles.viewRowArea}}>
            <CheckBox
              checked={isConsent.isToS}
              title="개인정보 수집 및 이용 (필수)"
              textStyle={{fontSize: scale(16), color: '#222222', fontWeight: 'normal'}}
              iconType="ionicon"
              uncheckedIcon="ios-checkmark-circle-outline"
              uncheckedColor="#e4e4e4"
              checkedIcon="ios-checkmark-circle-outline"
              checkedColor="#c01920"
              containerStyle={{...styles.viewCheckBoxArea, marginBottom: scale(15), flex: 1}}
              size={scale(25)}
              onPress={() => setIsConsent({...isConsent, isToS: !isConsent.isToS})}
            />
            <TouchableOpacity onPress={() => props.navigation.navigate('PP')}>
              <Icon
                name="ios-chevron-forward"
                type="ionicon"
                size={scale(25)}
                color="#dddddd"
                style={{marginBottom: scale(15)}}
              />
            </TouchableOpacity>
          </View>
          <View style={{...styles.viewRowArea}}>
            <CheckBox
              checked={isConsent.isMarketing}
              title="마케팅 정보 수신 (선택)"
              textStyle={{fontSize: scale(16), color: '#222222', fontWeight: 'normal'}}
              iconType="ionicon"
              uncheckedIcon="ios-checkmark-circle-outline"
              uncheckedColor="#e4e4e4"
              checkedIcon="ios-checkmark-circle-outline"
              checkedColor="#c01920"
              containerStyle={{...styles.viewCheckBoxArea, marginBottom: scale(15), flex: 1}}
              size={scale(25)}
              onPress={() => setIsConsent({...isConsent, isMarketing: !isConsent.isMarketing})}
            />
            <TouchableOpacity>
              <Icon
                name="ios-chevron-forward"
                type="ionicon"
                size={scale(25)}
                color="#dddddd"
                style={{marginBottom: scale(15)}}
              />
            </TouchableOpacity>
          </View>
        </View>
        <BannerImage />
      </SafeAreaView>
      <Button
        disabled={!(isConsent.isPP && isConsent.isToS)}
        title="회원가입하기"
        titleStyle={{fontSize: scale(17), fontWeight: 'bold', color: 'white'}}
        containerStyle={{borderRadius: 0}}
        buttonStyle={{
          borderRadius: 0,
          paddingBottom: isIphoneX() ? getBottomSpace() : scale(20),
          paddingTop: scale(20),
          backgroundColor: 'black',
        }}
        onPress={() => props.navigation.replace('SignUp', {IS_MARKETING: isConsent.isMarketing})}
      />
    </View>
  );
};

export default Consent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  viewInner: {
    padding: scale(15),
  },
  txtTitle: {
    fontSize: scale(25),
    color: '#222222',
    fontWeight: 'bold',
    marginBottom: scale(25),
  },
  viewCheckBoxArea: {
    backgroundColor: 'white',
    borderWidth: 0,
    padding: 0,
    marginLeft: 0,
    marginRight: 0,
    margin: 0,
  },
  viewRowArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
