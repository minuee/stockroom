import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, View} from 'react-native';

import scale from '../../common/Scale';
import {timeForToday} from '../../common/Utils';
import useAlert from '../../Hooks/useAlert';
import useLoading from '../../Hooks/useLoading';

import {Header, ListItem} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';

import {apiObject} from '../../common/API';

const Notification = props => {
  const alert = useAlert();
  const {isLoading, setIsLoading} = useLoading();

  const [dataList, setDataList] = useState({items: []});

  const _renderNoticeList = ({item: notifyItem}) => (
    <View>
      <ListItem bottomDivider={true} onPress={() => _updateNotifyViewCount(notifyItem.push_no)} activeOpacity={0.9}>
        <ListItem.Content>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <ListItem.Title style={{fontSize: scale(15)}}>{notifyItem.push_title}</ListItem.Title>
            {/* {notifyItem.isNew && (
              <FastImage
                source={require('../../../assets/images/drawable-xxxhdpi/notice_new_icon.png')}
                style={{width: scale(16), height: scale(16), marginLeft: scale(5)}}
              />
            )} */}
          </View>
          <ListItem.Subtitle style={{fontSize: scale(12)}}>{`${timeForToday(
            +new Date(notifyItem.create_at) / 1000
          )}`}</ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
    </View>
  );

  const _getNotificationList = async bool => {
    if (dataList.current_page === dataList.total_page && !bool) {
      return null;
    }
    try {
      const apiResult = await apiObject.getNotificationList(
        {
          next_token: bool ? null : dataList.next_token,
          limit: 15,
        },
        setIsLoading
      );

      if (bool) {
        setDataList(apiResult);
      } else {
        setDataList({
          items: [...dataList.items, ...apiResult.items],
          current_page: apiResult.current_page,
          total_page: apiResult.total_page,
          next_token: apiResult.next_token,
        });
      }
    } catch (error) {
      console.log('_getNotificationList -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _updateNotifyViewCount = async notice_no => {
    try {
      await apiObject.updateNotifyViewCount({no: notice_no});
    } catch (error) {
      console.log('🚀 ~ _updateNotifyViewCount= ~ error', error);
    }
  };

  useEffect(() => {
    _getNotificationList(true);
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
        centerComponent={{text: '알림', style: {fontSize: scale(21), fontWeight: 'bold'}}}
        centerContainerStyle={{justifyContent: 'center'}}
        placement="left"
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <FlatList
          data={dataList.items}
          renderItem={_renderNoticeList}
          keyExtractor={(item, index) => `notice_${index}`}
          refreshing={isLoading}
          onRefresh={() => _getNotificationList(true)}
          onEndReached={() => _getNotificationList()}
          onEndReachedThreshold={0.1}
        />
      </SafeAreaView>
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
});
