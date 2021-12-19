import React, {useState} from 'react';
import {KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import scale from '../../common/Scale';
import {isEmpty, isIOS, _chkPhone} from '../../common/Utils';
import useAlert from '../../Hooks/useAlert';
import useLoading from '../../Hooks/useLoading';
import useUserInfo from '../../Hooks/useUserInfo';
import {apiObject} from '../../common/API';

import {Button, Header, Input} from 'react-native-elements';
import {getBottomSpace, isIphoneX} from 'react-native-iphone-x-helper';
import Toast from 'react-native-simple-toast';

const ChangePhone = props => {
  const alert = useAlert();

  const {setUserInfo} = useUserInfo();
  const {setIsLoading, isLoading} = useLoading();

  const [inputPhone, setInputPhone] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isSentCode, setIsSentCode] = useState('');
  const [isPassedCode, setIsPassedCode] = useState('');
  const [respConfirmData, setRespConfirmData] = useState('');

  // 인증번호 전송
  const _onSendCodePress = async () => {
    try {
      const apiResult = await apiObject.postPreConfirmation(
        {
          user_phone_no: inputPhone,
        },
        setIsLoading
      );
      setIsSentCode(true);
      setRespConfirmData(apiResult);
      Toast.showWithGravity('인증번호가 전송되었습니다.', Toast.SHORT, Toast.CENTER);
    } catch (error) {
      console.log('🚀 ~ _onSendCodePress ~ error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  // 인증번호 확인
  const _onCheckCodePress = async () => {
    try {
      await apiObject.putPreConfirmation(
        {
          user_phone_no: inputPhone,
          user_confirm_code: inputCode,
          pre_confirmation_no: respConfirmData.pre_confirmation_no,
        },
        setIsLoading
      );
      Toast.showWithGravity('인증번호가 확인되었습니다.', Toast.SHORT, Toast.CENTER);
      setIsPassedCode(true);
    } catch (error) {
      console.log('🚀 ~ _onCheckCodePress ~ error', error.response.data.data.message);
      Toast.show(error.response.data.data.message, Toast.SHORT);
    }
  };

  const _onChangePhonePress = async () => {
    try {
      const apiResult = await apiObject.editUserInfo({
        user_phone_no: inputPhone,
      });

      setUserInfo({
        userPhone: apiResult.user_phone_no,
      });

      Toast.showWithGravity('핸드폰번호가 변경되었습니다.', Toast.SHORT, Toast.CENTER);
      props.navigation.goBack(null);
    } catch (error) {
      console.log('🚀 ~ _onChangePhonePress= ~ error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  return (
    <KeyboardAvoidingView style={{...styles.container}} behavior={isIOS() ? 'padding' : null}>
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
        centerComponent={{text: '휴대폰번호 변경', style: {fontSize: scale(21), fontWeight: 'bold'}}}
        centerContainerStyle={{justifyContent: 'center'}}
        placement="left"
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <View style={{...styles.viewInner}}>
          <Input
            label="휴대폰번호"
            labelStyle={{...styles.txtLabel}}
            placeholder="휴대폰번호를 입력해주세요. (- 제외)"
            placeholderTextColor="#dddddd"
            style={{fontSize: scale(15)}}
            containerStyle={{paddingHorizontal: 0}}
            value={inputPhone}
            onChangeText={setInputPhone}
            keyboardType="number-pad"
            maxLength={11}
            rightIcon={
              <Button
                disabled={!_chkPhone(inputPhone)}
                title={isSentCode ? '재요청' : '인증'}
                type="clear"
                titleStyle={{...styles.txtInputRight}}
                onPress={_onSendCodePress}
                loading={isLoading}
                loadingProps={{color: '#c01920'}}
              />
            }
          />
          <Input
            label="인증번호 입력"
            labelStyle={{...styles.txtLabel}}
            placeholder="인증번호 6자리를 입력해주세요."
            placeholderTextColor="#dddddd"
            style={{fontSize: scale(15)}}
            containerStyle={{paddingHorizontal: 0}}
            value={inputCode}
            onChangeText={setInputCode}
            keyboardType="number-pad"
            maxLength={6}
            rightIcon={
              <Button
                disabled={!(isSentCode && inputCode.length === 6 && !isPassedCode)}
                title={isPassedCode ? '인증완료' : '인증확인'}
                type="clear"
                titleStyle={{...styles.txtInputRight}}
                onPress={_onCheckCodePress}
                loading={isLoading}
                loadingProps={{color: '#c01920'}}
              />
            }
          />
        </View>
      </SafeAreaView>
      <Button
        disabled={!isPassedCode}
        title="변경완료"
        titleStyle={{fontSize: scale(17), fontWeight: 'bold', color: 'white'}}
        containerStyle={{borderRadius: 0}}
        buttonStyle={{
          borderRadius: 0,
          paddingBottom: isIphoneX() ? getBottomSpace() : scale(20),
          paddingTop: scale(20),
          backgroundColor: 'black',
        }}
        onPress={_onChangePhonePress}
      />
    </KeyboardAvoidingView>
  );
};

export default ChangePhone;

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
  txtInputRight: {
    fontSize: scale(15),
    fontWeight: 'bold',
    color: '#c01920',
  },
  txtLabel: {
    fontSize: scale(12),
    color: '#222222',
    fontWeight: 'bold',
  },
});
