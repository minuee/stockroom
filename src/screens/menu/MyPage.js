import React, {useCallback, useMemo, useRef, useState} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import scale from '../../common/Scale';
import {isEmpty} from '../../common/Utils';
import useAlert from '../../Hooks/useAlert';
import useUserInfo from '../../Hooks/useUserInfo';

import {Avatar, Badge, Button, Header, Icon, ListItem, Accessory} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import {getBottomSpace, isIphoneX} from 'react-native-iphone-x-helper';
import {launchImageLibrary} from 'react-native-image-picker';
import {BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import Toast from 'react-native-simple-toast';

import {apiObject} from '../../common/API';

import {Auth, AuthType} from '@psyrenpark/auth';
import {Storage} from '@psyrenpark/storage';

const menuList = [
  {
    label: '내 정보 설정',
    list: [
      {
        title: '닉네임(대화명) 변경',
        navigate: 'ChangeNickName',
      },
      {
        title: '비밀번호 변경',
        navigate: 'ChangePass',
      },
      {
        title: '휴대폰번호 변경',
        navigate: 'ChangePhone',
      },
      {
        title: '투자정보 설정',
        navigate: 'ChangeUserType',
      },
    ],
  },
  {
    label: '고객센터',
    list: [
      {
        title: '이용약관',
        navigate: 'TOS',
      },
      {
        title: '개인정보처리방침',
        navigate: 'PP',
      },
      {
        title: '서비스 이용 문의',
        navigate: 'Inquire',
      },
    ],
  },
];

const MyPage = props => {
  const alert = useAlert();

  const {userName, userEmail, userType, userImage, setUserInfo, resetUserInfo} = useUserInfo();

  const snapPoints = useMemo(() => ['20%'], []);
  const refBottomSheetModal = useRef(null);

  const _renderMyPageList = useCallback(
    ({item: menuListItem}) => (
      <View>
        <View style={{backgroundColor: '#f6f6f6', paddingHorizontal: scale(15), paddingVertical: scale(7)}}>
          <Text style={{fontSize: scale(12), fontWeight: 'bold', color: '#999999'}}>{menuListItem.label}</Text>
        </View>
        {menuListItem.list.map((item, index) => (
          <ListItem
            key={`menu_${index}`}
            bottomDivider={index !== menuListItem.list.length}
            onPress={() => props.navigation.navigate(item.navigate)}
            activeOpacity={0.9}>
            <ListItem.Content>
              <ListItem.Title>{item.title}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron name="ios-chevron-forward" type="ionicon" size={scale(25)} />
          </ListItem>
        ))}
      </View>
    ),
    []
  );

  const _onSignOutPress = useCallback(() => {
    alert({
      type: 'info',
      title: '정말 로그아웃 할까요?',
      body: '로그아웃을 하면 서비스 이용과\n푸시알림 이용이 불가합니다.',
      btnText: '로그아웃',
      renderLeftBtn: true,
      leftBtnText: '취소',
      btnPress: () => _signOut(),
    });
  }, []);

  const _signOut = async () => {
    Auth.signOutProcess(
      {
        authType: AuthType.EMAIL,
      },
      async success => {
        resetUserInfo();
      },
      error => {
        console.log('_signOut -> error', error);
      }
    );
  };

  const _changeDefaultProfile = useCallback(async image_data => {
    if (image_data?.didCancel) {
      return null;
    }

    refBottomSheetModal.current.dismiss();

    try {
      if (isEmpty(image_data)) {
        const apiResult = await apiObject.editUserInfo({user_profile_image_no: 1});

        setUserInfo({userImage: apiResult.user_profile_image});
      } else {
        const userId = userEmail.split('@')[0];
        const result = await fetch(image_data.uri);
        const blob = await result.blob();
        let fileName = blob._data.name;
        let extensionName = fileName.split('.')[1];
        let now_timestamp = Math.floor(new Date().getTime() / 1000);
        fileName = `${userId}_${now_timestamp}.${extensionName}`;

        Toast.showWithGravity('프로필 이미지 처리중입니다.', Toast.LONG, Toast.CENTER);

        const storageUrl = await Storage.put({
          key: `profile/${fileName}`,
          object: blob,
          config: {
            contentType: 'image',
          },
        });

        const imageUploadResult = await apiObject.createImage({
          image_type_code_id: 'PROFILE',
          image_file_path: storageUrl.key,
        });

        const apiResult = await apiObject.editUserInfo({user_profile_image_no: Number(imageUploadResult.image_no)});

        setUserInfo({userImage: apiResult.user_profile_image});
      }
    } catch (error) {
      console.log('🚀 ~ _changeDefaultProfile ~ error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
      refBottomSheetModal.current.dismiss();
    }
  }, []);

  const _onChangeProfilePress = useCallback(async () => {
    userImage.image_no === '1'
      ? launchImageLibrary({mediaType: 'photo', maxHeight: 1024, maxWidth: 1024}, imageResp => {
          _changeDefaultProfile(imageResp);
        })
      : refBottomSheetModal.current.present();
  }, [userImage]);

  return (
    <BottomSheetModalProvider>
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
          centerComponent={{text: '마이페이지', style: {fontSize: scale(21), fontWeight: 'bold'}}}
          centerContainerStyle={{justifyContent: 'center'}}
          placement="left"
          rightComponent={
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity onPress={() => props.navigation.navigate('BlockList')}>
                <Icon name="ios-person-outline" type="ionicon" size={scale(25)} style={{marginRight: scale(15)}} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => props.navigation.navigate('Notification')}>
                <Icon name="ios-notifications-outline" type="ionicon" size={scale(25)} />
                {/* {dataList.isNewPush && <Badge status="error" containerStyle={{position: 'absolute', right: 0}} />} */}
              </TouchableOpacity>
            </View>
          }
          rightContainerStyle={{justifyContent: 'center'}}
          containerStyle={{borderBottomWidth: 0}}
        />
        <SafeAreaView style={{...styles.contents}}>
          <View style={{...styles.viewUserInfoArea}}>
            <Avatar
              source={{uri: userImage.image_full_file_path}}
              size={scale(60)}
              containerStyle={{marginRight: scale(10)}}
              avatarStyle={{borderRadius: scale(20)}}>
              <Accessory size={scale(21)} onPress={() => _onChangeProfilePress()} underlayColor={'rgba(0, 0, 0, .3)'} />
            </Avatar>
            <View style={{flex: 1}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontSize: scale(23)}}>
                  <Text style={{fontWeight: 'bold'}}>{userName}</Text>
                  {' 님 '}
                </Text>
                <Text style={{fontSize: scale(18)}}>{`(${userType})`}</Text>
              </View>
              <Text style={{fontSize: scale(14), color: '#999999'}}>{userEmail}</Text>
            </View>
          </View>
          <FlatList
            data={menuList}
            renderItem={_renderMyPageList}
            keyExtractor={(item, index) => `menuList_${index}`}
          />
        </SafeAreaView>
        <View style={{...styles.viewAround, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#dddddd'}}>
          <Button
            title="로그아웃"
            titleStyle={{fontSize: scale(15), color: '#222222', textDecorationLine: 'underline'}}
            type="clear"
            buttonStyle={{paddingVertical: scale(20)}}
            containerStyle={{width: '25%'}}
            onPress={() => _onSignOutPress()}
          />
        </View>
        <BottomSheetModal
          ref={refBottomSheetModal}
          index={0}
          snapPoints={snapPoints}
          backdropComponent={backdropProps => <BottomSheetBackdrop {...backdropProps} />}>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <Button
              title="기본 이미지로 변경"
              titleStyle={{fontSize: scale(18), color: '#222222'}}
              containerStyle={{flex: 1, justifyContent: 'center'}}
              type="clear"
              onPress={() => _changeDefaultProfile()}
            />
            <Button
              title="새로운 이미지로 변경"
              titleStyle={{fontSize: scale(18), color: '#222222'}}
              containerStyle={{flex: 1, justifyContent: 'center'}}
              type="clear"
              onPress={() =>
                launchImageLibrary({mediaType: 'photo', maxHeight: 1024, maxWidth: 1024}, imageResp => {
                  _changeDefaultProfile(imageResp);
                })
              }
            />
          </View>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

export default MyPage;

const styles = StyleSheet.create({
  conatiner: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  viewUserInfoArea: {
    padding: scale(15),
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAround: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    ...(isIphoneX() && {paddingBottom: getBottomSpace()}),
  },
});
