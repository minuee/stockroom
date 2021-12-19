import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, View} from 'react-native';

import scale from '../../common/Scale';
import {isEmpty, YYYYMMDD} from '../../common/Utils';
import useAlert from '../../Hooks/useAlert';
import useLoading from '../../Hooks/useLoading';

import {Header, ListItem} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';

import {apiObject} from '../../common/API';

const Notice = props => {
  const alert = useAlert();
  const {isLoading, setIsLoading} = useLoading();

  const [opendIndex, setOpendIndex] = useState(null);
  const [dataList, setDataList] = useState({items: []});

  const _renderNoticeList = ({item: noticeItem, index: noticeIndex}) => (
    <View>
      <ListItem
        bottomDivider={true}
        onPress={() => {
          setOpendIndex(prevIndex => (prevIndex === noticeIndex ? null : noticeIndex));
          _updateNoticeViewCount(noticeItem.notice_no);
        }}
        activeOpacity={0.9}>
        <FastImage
          source={require('../../../assets/images/drawable-xxxhdpi/rhc_icon_notification.png')}
          style={{width: scale(32), height: scale(32)}}
        />
        <ListItem.Content>
          <View
            style={
              {
                // flexDirection: 'row',
              }
            }>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <ListItem.Title style={{fontSize: scale(15)}}>{noticeItem.notice_title}</ListItem.Title>
              {/* {noticeItem.isNew && (
              <FastImage
                source={require('../../../assets/images/drawable-xxxhdpi/notice_new_icon.png')}
                style={{width: scale(16), height: scale(16), marginLeft: scale(5)}}
              />
            )} */}
            </View>
            <ListItem.Subtitle style={{fontSize: scale(12)}}>{`${YYYYMMDD(
              +new Date(noticeItem.create_at) / 1000
            )}`}</ListItem.Subtitle>
          </View>
        </ListItem.Content>
        <ListItem.Chevron
          name={opendIndex === noticeIndex ? 'ios-chevron-up' : 'ios-chevron-down'}
          type="ionicon"
          size={scale(25)}
        />
      </ListItem>
      {opendIndex === noticeIndex && (
        <View style={{padding: scale(15), backgroundColor: '#f5f5f5'}}>
          {!isEmpty(noticeItem.notice_image) && (
            <FastImage
              source={{uri: noticeItem.notice_image.image_full_file_path}}
              style={{aspectRatio: 0.5}}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
          <Text style={{fontSize: scale(13), lineHeight: scale(20)}}>{noticeItem.notice_content}</Text>
        </View>
      )}
    </View>
  );

  const _getNoticeList = async bool => {
    if (dataList.current_page === dataList.total_page && !bool) {
      return null;
    }
    try {
      const apiResult = await apiObject.getNoticeList(
        {
          next_token: bool ? null : dataList.next_token,
          limit: 20,
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
      console.log('_getNoticeList -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _updateNoticeViewCount = async notice_no => {
    try {
      await apiObject.updateNoticeViewCount({no: notice_no});
    } catch (error) {
      console.log('🚀 ~ _updateNoticeViewCount= ~ error', error);
    }
  };

  useEffect(() => {
    _getNoticeList(true);
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
        centerComponent={{text: '공지사항', style: {fontSize: scale(21), fontWeight: 'bold'}}}
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
          onRefresh={() => _getNoticeList(true)}
          onEndReached={() => _getNoticeList()}
          onEndReachedThreshold={0.1}
        />
      </SafeAreaView>
    </View>
  );
};

export default Notice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
});
