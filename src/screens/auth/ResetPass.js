import React, {useEffect, useState, useMemo, useCallback, useRef} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {addComma, isEmpty, isIOS, _chkEmail, _chkPhone} from '../../common/Utils';
import scale from '../../common/Scale';
import useAlert from '../../Hooks/useAlert';
import useLoading from '../../Hooks/useLoading';
import {apiObject} from '../../common/API';

import {Button, CheckBox, Header, Icon, Input} from 'react-native-elements';
import {TabView} from 'react-native-tab-view';
import {getBottomSpace, isIphoneX} from 'react-native-iphone-x-helper';
import Toast from 'react-native-simple-toast';

import {Auth, AuthType} from '@psyrenpark/auth';
import BannerImage from '../common/BannerImage';

const ResetPass = props => {
  const alert = useAlert();
  const {isLoading, setIsLoading} = useLoading();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'one', title: '재설정1'},
    {key: 'two', title: '재설정2'},
  ]);

  const [inputCode, setInputCode] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputPass, setInputPass] = useState('');
  const [inputConfirmPass, setInputConfirmPass] = useState('');
  const [directExit, setDirectExit] = useState(false);

  // 뒤로가기 방지
  useEffect(
    () =>
      props.navigation.addListener('beforeRemove', e => {
        e.preventDefault();
        if (directExit) {
          props.navigation.dispatch(e.data.action);
          return null;
        }
        if (index === 0) {
          alert({
            type: 'info',
            title: '[주의]',
            body: '뒤로가시겠습니까?\n입력한 모든 정보가 사라집니다.',
            btnText: '나가기',
            btnPress: () => props.navigation.dispatch(e.data.action),
            renderLeftBtn: true,
            leftBtnText: '취소',
          });
        } else {
          setIndex(index - 1);
        }
      }),
    [index, props.navigation, directExit]
  );

  const _renderTabs = ({route}) => {
    switch (route.key) {
      case 'one':
        return (
          <ScrollView scrollEnabled={false} keyboardShouldPersistTaps="handled">
            <Input
              label="이메일"
              labelStyle={{...styles.txtLabel}}
              placeholder="가입시 입력한 이메일 주소를 입력해주세요."
              placeholderTextColor="#dddddd"
              style={{fontSize: scale(15)}}
              containerStyle={{paddingHorizontal: 0}}
              value={inputEmail}
              onChangeText={setInputEmail}
              keyboardType="email-address"
            />
          </ScrollView>
        );

      case 'two':
        return (
          <ScrollView scrollEnabled={false} keyboardShouldPersistTaps="handled">
            <Input
              label="이메일 인증번호"
              labelStyle={{...styles.txtLabel}}
              placeholder="이메일로 도착한 인증번호를 입력해주세요."
              placeholderTextColor="#dddddd"
              style={{fontSize: scale(15)}}
              containerStyle={{paddingHorizontal: 0}}
              value={inputCode}
              onChangeText={setInputCode}
              maxLength={6}
              keyboardType="number-pad"
            />
            <Input
              label="새로운 비밀번호"
              labelStyle={{...styles.txtLabel}}
              placeholder="6자리 이상의 비밀번호를 입력해주세요."
              placeholderTextColor="#dddddd"
              style={{fontSize: scale(15)}}
              containerStyle={{paddingHorizontal: 0}}
              value={inputPass}
              onChangeText={setInputPass}
              secureTextEntry={true}
            />
            <Input
              label="비밀번호 확인"
              labelStyle={{...styles.txtLabel}}
              placeholder="비밀번호를 한 번 더 입력해주세요."
              placeholderTextColor="#dddddd"
              style={{fontSize: scale(15)}}
              containerStyle={{paddingHorizontal: 0}}
              value={inputConfirmPass}
              onChangeText={setInputConfirmPass}
              secureTextEntry={true}
            />
          </ScrollView>
        );
    }
  };

  const _disabledProcess = () => {
    switch (index) {
      case 0:
        return !isEmpty(inputEmail) && _chkEmail(inputEmail);

      case 1:
        return !isEmpty(inputCode) || !isEmpty(inputPass) || !isEmpty(inputConfirmPass);
    }
  };

  const _onSignUpStepPress = () => {
    switch (index) {
      case 0:
        Auth.forgotPasswordProcess(
          {
            email: inputEmail,
            authType: AuthType.EMAIL,
          },
          data => {
            setIndex(1);
          },
          error => {
            console.log('_onResetPassPress -> error', error);
            Toast.show('정상적인 이메일인지 다시 확인해주세요.', Toast.SHORT);
          },
          setIsLoading
        );
        break;

      case 1:
        Auth.confirmForgotPasswordProcess(
          {
            email: inputEmail,
            authType: AuthType.EMAIL,
            code: inputCode,
            newPassword: inputPass,
          },
          data => {
            setDirectExit(true);
            setTimeout(() => {
              _globalSignOut();
            }, 500);
          },
          error => {
            switch (error.code) {
              case 'CodeMismatchException':
                Toast.show('인증번호가 일치하지 않습니다.\n다시 입력해주세요.', Toast.SHORT);
                break;

              case 'LimitExceededException':
                Toast.show('인증 횟수를 초과했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
                break;
            }
          },
          setIsLoading
        );
        break;
    }
  };

  const _globalSignOut = () => {
    Auth.signOutProcess(
      {
        authType: AuthType.EMAIL,
      },
      success => {
        Toast.show('비밀번호를 초기화했습니다.\n다시 로그인해주세요.', Toast.SHORT);
        props.navigation.goBack(null);
      },
      error => {
        console.log('_signOutPress -> error', error);
        Toast.show('비밀번호를 초기화했습니다.\n다시 로그인해주세요.', Toast.SHORT);
        props.navigation.goBack(null);
      }
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
          size: scale(25),
          onPress: () => props.navigation.goBack(null),
        }}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <View style={{...styles.viewInner}}>
          <Text style={{...styles.txtTitle, marginBottom: index === 0 ? scale(25) : 0}}>비밀번호 재설정</Text>
          {index === 1 && (
            <Text style={{marginBottom: scale(25)}}>{`${inputEmail}\n이메일로 전송된 인증번호를 입력해주세요.`}</Text>
          )}
          <TabView
            swipeEnabled={false}
            renderTabBar={() => null}
            navigationState={{index, routes}}
            renderScene={_renderTabs}
            onIndexChange={setIndex}
          />
        </View>
        <BannerImage />
      </SafeAreaView>
      <Button
        disabled={!_disabledProcess()}
        title={index === 1 ? '재설정' : '다음'}
        titleStyle={{fontSize: scale(17), fontWeight: 'bold', color: 'white'}}
        containerStyle={{borderRadius: 0}}
        buttonStyle={{
          borderRadius: 0,
          paddingBottom: isIphoneX() ? getBottomSpace() : scale(20),
          paddingTop: scale(20),
          backgroundColor: 'black',
        }}
        onPress={_onSignUpStepPress}
        loading={isLoading}
      />
    </KeyboardAvoidingView>
  );
};

export default ResetPass;

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
    flex: 1,
  },
  txtTitle: {
    fontSize: scale(25),
    color: '#222222',
    fontWeight: 'bold',
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
  viewTypeArea: (type, myType) => ({
    marginBottom: scale(10),
    flexDirection: 'row',
    padding: scale(10),
    alignItems: 'center',
    borderWidth: scale(1),
    borderColor: type === myType ? '#c01920' : '#dddddd',
    justifyContent: 'space-between',
  }),
  txtTypeLabel: (type, myType) => ({
    fontSize: scale(13),
    fontWeight: type === myType ? 'bold' : 'normal',
    color: type === myType ? '#c01920' : '#999999',
    flex: 1,
  }),
  viewSelectArea: {
    borderBottomWidth: scale(1),
    borderBottomColor: '#999999',
    paddingVertical: scale(7),
    marginBottom: scale(15),
  },
  viewSelectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewCheckBoxArea: {
    backgroundColor: 'white',
    borderWidth: 0,
    padding: 0,
    marginLeft: 0,
    marginRight: 0,
    margin: 0,
  },
});
