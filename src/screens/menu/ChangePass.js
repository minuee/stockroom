import React, {useState} from 'react';
import {KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import scale from '../../common/Scale';
import {isEmpty, isIOS} from '../../common/Utils';
import useAlert from '../../Hooks/useAlert';
import useUserInfo from '../../Hooks/useUserInfo';
import useLoading from '../../Hooks/useLoading';

import {Button, Header, Input} from 'react-native-elements';
import {getBottomSpace, isIphoneX} from 'react-native-iphone-x-helper';
import Toast from 'react-native-simple-toast';

import {Auth, AuthType} from '@psyrenpark/auth';

const ChangePass = props => {
  const alert = useAlert();

  const {isLoading, setIsLoading} = useLoading();
  const {userEmail} = useUserInfo();

  const [inputNowPass, setInputNowPass] = useState('');
  const [inputNewPass, setInputNewPass] = useState('');
  const [inputNewPassConfirm, setInputNewPassConfirm] = useState('');

  const _onChangePassPress = async () => {
    Auth.changePasswordProcess(
      {
        email: userEmail,
        authType: AuthType.EMAIL,
        oldPassword: inputNowPass,
        newPassword: inputNewPass,
      },
      async data => {
        Toast.showWithGravity('비밀번호가 변경되었습니다.', Toast.SHORT, Toast.CENTER);
        props.navigation.goBack(null);
      },
      error => {
        console.log(error.code);
        switch (error.code) {
          case 'NotAuthorizedException':
            Toast.show('현재 비밀번호가 틀렸습니다.\n다시 입력해주세요.', Toast.SHORT);
            break;

          case 'SamePasswordException':
            Toast.show('현재 비밀번호와 새 비밀번호가 같습니다.\n다시 입력해주세요.', Toast.SHORT);
            break;

          default:
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
            break;
        }
      },
      setIsLoading
    );
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
        centerComponent={{text: '비밀번호 변경', style: {fontSize: scale(21), fontWeight: 'bold'}}}
        centerContainerStyle={{justifyContent: 'center'}}
        placement="left"
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <View style={{...styles.viewInner}}>
          <Input
            label="현재 비밀번호"
            labelStyle={{...styles.txtLabel}}
            placeholder="현재 비밀번호를 입력해주세요."
            placeholderTextColor="#dddddd"
            style={{fontSize: scale(15)}}
            containerStyle={{paddingHorizontal: 0}}
            value={inputNowPass}
            onChangeText={setInputNowPass}
            secureTextEntry={true}
          />
          <Input
            label="새로운 비밀번호"
            labelStyle={{...styles.txtLabel}}
            placeholder="6자리 이상의 비밀번호를 입력해주세요."
            placeholderTextColor="#dddddd"
            style={{fontSize: scale(15)}}
            containerStyle={{paddingHorizontal: 0}}
            value={inputNewPass}
            onChangeText={setInputNewPass}
            secureTextEntry={true}
          />
          <Input
            label="새로운 비밀번호 확인"
            labelStyle={{...styles.txtLabel}}
            placeholder="새로운 비밀번호를 한 번 더 입력해주세요."
            placeholderTextColor="#dddddd"
            style={{fontSize: scale(15)}}
            containerStyle={{paddingHorizontal: 0}}
            value={inputNewPassConfirm}
            onChangeText={setInputNewPassConfirm}
            secureTextEntry={true}
          />
        </View>
      </SafeAreaView>
      <Button
        disabled={
          !(
            !isEmpty(inputNowPass) &&
            !isEmpty(inputNewPass) &&
            !isEmpty(inputNewPassConfirm) &&
            inputNewPass === inputNewPassConfirm &&
            inputNewPass.length >= 6
          )
        }
        title="변경완료"
        titleStyle={{fontSize: scale(17), fontWeight: 'bold', color: 'white'}}
        containerStyle={{borderRadius: 0}}
        buttonStyle={{
          borderRadius: 0,
          paddingBottom: isIphoneX() ? getBottomSpace() : scale(20),
          paddingTop: scale(20),
          backgroundColor: 'black',
        }}
        onPress={_onChangePassPress}
        loading={isLoading}
      />
    </KeyboardAvoidingView>
  );
};

export default ChangePass;

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
