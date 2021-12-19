import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, View} from 'react-native';

import scale from '../../common/Scale';
import {isEmptyArr, YYYYMMDD} from '../../common/Utils';
import useAlert from '../../Hooks/useAlert';
import useLoading from '../../Hooks/useLoading';

import {Avatar, Button, Header, ListItem} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';

import {apiObject} from '../../common/API';
import useUserInfo from '../../Hooks/useUserInfo';

const BlockList = props => {
  const alert = useAlert();
  const {isLoading, setIsLoading} = useLoading();
  const {setUserInfo} = useUserInfo();

  const [dataList, setDataList] = useState([]);

  const _renderBlockList = ({item: blockUserItem}) => (
    <ListItem bottomDivider={true}>
      <Avatar source={{uri: blockUserItem.ignore_user.image_full_file_path}} size={scale(35)} />
      <ListItem.Content>
        <ListItem.Title style={{fontSize: scale(15)}}>{blockUserItem.ignore_user.user_nick_name}</ListItem.Title>
      </ListItem.Content>
      <Button
        title="차단해제"
        titleStyle={{fontSize: scale(13), fontWeight: 'bold', color: 'white'}}
        buttonStyle={{backgroundColor: 'black'}}
        // onPress={() => _setIgnoreToUser(blockUserItem.ignore_user_no)}
        onPress={() =>
          alert({
            type: 'info',
            title: '[안내]',
            body: '해당 유저의 차단을 해제할까요?',
            btnText: '차단해제',
            btnPress: () => _setIgnoreToUser(blockUserItem.ignore_user_no),
            renderLeftBtn: true,
            leftBtnText: '취소',
          })
        }
      />
    </ListItem>
  );

  const _getBlockList = async () => {
    try {
      const apiResult = await apiObject.listIgnoreToUserList(setIsLoading);

      setDataList(apiResult.items);
      setUserInfo({blockList: apiResult.items});
    } catch (error) {
      console.log('_getBlockList -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _setIgnoreToUser = async ignore_user_no => {
    try {
      const apiResult = await apiObject.setIgnoreToUser({ignore_user_no, flag: false});

      setDataList(apiResult.items);
      setUserInfo({blockList: apiResult.items});
    } catch (error) {
      console.log('🚀 ~ _setIgnoreToUser= ~ error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  useEffect(() => {
    _getBlockList();
  }, []);

  return (
    <View style={{...styles.container}}>
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
        centerComponent={{text: '차단목록', style: {fontSize: scale(21), fontWeight: 'bold'}}}
        centerContainerStyle={{justifyContent: 'center'}}
        placement="left"
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        {isEmptyArr(dataList) ? (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: scale(20), color: '#bbbbbb'}}>차단 유저가 없어요 :)</Text>
          </View>
        ) : (
          <FlatList
            data={dataList}
            renderItem={_renderBlockList}
            keyExtractor={(item, index) => `notice_${index}`}
            refreshing={isLoading}
            onRefresh={() => _getBlockList()}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

export default BlockList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
});
