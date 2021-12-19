import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, View, KeyboardAvoidingView} from 'react-native';

import scale from '../../common/Scale';
import {isEmpty, isIOS, YYYYMMDD} from '../../common/Utils';
import useAlert from '../../Hooks/useAlert';
import useLoading from '../../Hooks/useLoading';

import {Button, Header, Input, ListItem} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';
import {getBottomSpace, isIphoneX} from 'react-native-iphone-x-helper';

import {apiObject} from '../../common/API';

const Inquire = props => {
  const alert = useAlert();
  const {isLoading, setIsLoading} = useLoading();

  const [inputTitle, setInputTitle] = useState('');
  const [inputContent, setInputContent] = useState('');

  const _postMyInquire = async () => {
    try {
      await apiObject.postMyInquire(
        {
          inquiry_title: inputTitle,
          inquiry_content: inputContent,
        },
        setIsLoading
      );

      Toast.showWithGravity('문의가 등록되었습니다.', Toast.SHORT, Toast.CENTER);
      props.navigation.goBack(null);
    } catch (error) {
      console.log('_postMyInquire -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  return (
    <KeyboardAvoidingView style={{...styles.container}} behavior={isIOS() ? 'padding' : null}>
      <Header
        backgroundColor="transparent"
        statusBarProps={{translucent: true, backgroundColor: 'transparent', barStyle: 'dark-content', animated: true}}
        leftComponent={{
          icon: 'ios-close-outline',
          type: 'ionicon',
          size: scale(40),
          color: 'black',
          onPress: () => props.navigation.goBack(null),
        }}
        centerComponent={{text: '서비스 이용 문의', style: {fontSize: scale(21), fontWeight: 'bold'}}}
        centerContainerStyle={{justifyContent: 'center'}}
        placement="left"
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <View style={{...styles.viewInner}}>
          <Input placeholder="제목" onChangeText={setInputTitle} />
          <Input
            placeholder={'질문 내용을 작성해주세요. 문의하신 내용은 빠른 검토 후, 개별 연락드리겠습니다. 감사합니다.'}
            textAlignVertical={'top'}
            multiline={true}
            inputStyle={{height: scale(200)}}
            onChangeText={setInputContent}
          />
        </View>
      </SafeAreaView>
      <Button
        disabled={!(!isEmpty(inputTitle) && !isEmpty(inputContent) && inputContent.length >= 5)}
        title={'문의 등록'}
        titleStyle={{fontSize: scale(17), fontWeight: 'bold', color: 'white'}}
        containerStyle={{borderRadius: 0}}
        buttonStyle={{
          borderRadius: 0,
          paddingBottom: isIphoneX() ? getBottomSpace() : scale(20),
          paddingTop: scale(20),
          backgroundColor: 'black',
        }}
        onPress={_postMyInquire}
      />
    </KeyboardAvoidingView>
  );
};

export default Inquire;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  viewInner: {
    padding: scale(10),
  },
});
