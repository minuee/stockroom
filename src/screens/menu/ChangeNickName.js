import React, {useState} from 'react';
import {KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import scale from '../../common/Scale';
import {isEmpty, isIOS} from '../../common/Utils';
import useAlert from '../../Hooks/useAlert';
import useUserInfo from '../../Hooks/useUserInfo';
import {apiObject} from '../../common/API';

import {Button, Header, Input} from 'react-native-elements';
import {getBottomSpace, isIphoneX} from 'react-native-iphone-x-helper';
import Toast from 'react-native-simple-toast';

const ChangeNickName = props => {
  const alert = useAlert();

  const {setUserInfo} = useUserInfo();

  const [inputNickName, setInputNickName] = useState('');
  // const [isUsedNickName, setIsUsedNickName] = useState(false);

  // const _chkNickNameAvailable = () => {
  //   setIsUsedNickName(false);
  //   alert({
  //     title: '사용가능',
  //     body: '사용가능한 닉네임입니다!',
  //     btnText: '확인',
  //   });
  // };

  const _onChangeNickNamePress = async () => {
    try {
      const apiResult = await apiObject.editUserInfo({
        user_nick_name: inputNickName,
      });

      setUserInfo({
        userNickName: apiResult.user_nick_name,
      });

      Toast.showWithGravity('닉네임이 변경되었습니다.', Toast.SHORT, Toast.CENTER);
      props.navigation.goBack(null);
    } catch (error) {
      console.log('🚀 ~ _onChangeNickNamePress= ~ error', error);
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
        centerComponent={{text: '닉네임(대화명 변경)', style: {fontSize: scale(21), fontWeight: 'bold'}}}
        centerContainerStyle={{justifyContent: 'center'}}
        placement="left"
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <View style={{...styles.viewInner}}>
          <Input
            label="닉네임 설정"
            labelStyle={{...styles.txtLabel}}
            placeholder="체험방 채팅 닉네임(대화명) 2 ~ 10자"
            placeholderTextColor="#dddddd"
            style={{fontSize: scale(15)}}
            containerStyle={{paddingHorizontal: 0}}
            value={inputNickName}
            onChangeText={setInputNickName}
            // rightIcon={
            //   <TouchableOpacity onPress={_chkNickNameAvailable}>
            //     <Text style={{...styles.txtInputRight}}>중복확인</Text>
            //   </TouchableOpacity>
            // }
            maxLength={10}
          />
        </View>
      </SafeAreaView>
      <Button
        disabled={!(!isEmpty(inputNickName) && inputNickName.length >= 2)}
        title="변경완료"
        titleStyle={{fontSize: scale(17), fontWeight: 'bold', color: 'white'}}
        containerStyle={{borderRadius: 0}}
        buttonStyle={{
          borderRadius: 0,
          paddingBottom: isIphoneX() ? getBottomSpace() : scale(20),
          paddingTop: scale(20),
          backgroundColor: 'black',
        }}
        onPress={_onChangeNickNamePress}
      />
    </KeyboardAvoidingView>
  );
};

export default ChangeNickName;

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
