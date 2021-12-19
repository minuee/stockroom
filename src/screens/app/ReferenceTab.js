import React, {useRef, useState, useMemo, useCallback} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, RefreshControl, FlatList} from 'react-native';
import {BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {useFocusEffect} from '@react-navigation/native';

import {Icon, ListItem} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Animated from 'react-native-reanimated';

import scale from '../../common/Scale';
import {addComma, changeTime, isEmpty, screenHeight} from '../../common/Utils';
import {apiObject} from '../../common/API';
import useLoading from '../../Hooks/useLoading';

const ReferenceTab = ({navigation}) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const {isLoading, setIsLoading} = useLoading();
  const refBottomSheetFilter = useRef(null);
  const snapFilterPoints = useMemo(() => ['30%'], []);

  const [referenceList, setReferenceList] = useState({items: [], current_page: 0, next_token: undefined});
  const [orderBy, setOrderBy] = useState('최신순');

  // 수익 인증 가져오기
  const _getReferenceList = async onRefresh => {
    //console.log('# getReferenceList');
    try {
      let orderByData;
      switch (orderBy) {
        case '최신순':
          orderByData = JSON.stringify({create_at: 'DESC'});
          break;

        case '오래된순':
          orderByData = JSON.stringify({create_at: 'ASC'});
          break;

        case '조회순':
          orderByData = JSON.stringify({profit_cert_view_count: 'DESC'});
          break;

        default:
          orderByData = JSON.stringify({create_at: 'DESC'});
          break;
      }

      if (!onRefresh && !referenceList.next_token) {
        //console.log('just return');
        return;
      } else {
        const apiResultProfits = await apiObject.getReferenceList(
          {
            page: onRefresh ? 1 : referenceList.current_page + 1,
            next_token: onRefresh ? null : referenceList.next_token,
            orderBy: orderByData,
          },
          setIsLoading
        );

        if (onRefresh) {
          setReferenceList(apiResultProfits);
        } else {
          setReferenceList({
            items: [...referenceList.items, ...apiResultProfits.items],
            current_page: apiResultProfits.current_page,
            next_token: apiResultProfits.next_token,
          });
        }
        //console.log('success! : ', apiResultProfits);
      }
    } catch (error) {
      console.log('🚀 ~ _getReferenceList= ~ error', error);
    }
  };

  // 각 항목 조회수 올리기
  const _updateReferenceViewCount = async reference_no => {
    try {
      await apiObject.updateReferenceViewCount({no: reference_no});
    } catch (error) {
      console.log('🚀 ~ updateReferenceViewCount= ~ error', error);
    }
  };

  const _renderHeader = () => {
    return (
      <View
        style={{
          backgroundColor: '#f1f1f1',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: scale(10),
          paddingHorizontal: scale(15),
        }}>
        <Text style={{fontSize: scale(14), fontWeight: 'bold', color: '#555555'}}>
          전체 {referenceList.items.length}건
        </Text>
        <TouchableOpacity onPress={() => refBottomSheetFilter.current?.present()}>
          <Text style={{fontSize: scale(14), color: '#555555'}}>{orderBy}⬇︎</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const _renderRhcList = props => {
    const eachItem = props.item;
    const index = props.index;

    return (
      <ListItem
        bottomDivider={index !== referenceList.items.length - 1}
        key={`reference_${index}`}
        onPress={() => {
          _updateReferenceViewCount(eachItem.reference_room_no);
          navigation.navigate('ReferenceDetail', {REFERENCE_DATA: eachItem});
        }}>
        <ListItem.Content>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <ListItem.Title style={{fontSize: scale(15)}}>{eachItem.reference_room_title}</ListItem.Title>
          </View>
          <ListItem.Subtitle style={{fontSize: scale(12)}}>{`${changeTime(
            +new Date(eachItem.create_at) / 1000
          )} • 조회 ${addComma(eachItem.reference_room_view_count)}`}</ListItem.Subtitle>
        </ListItem.Content>
        {(!isEmpty(eachItem.reference_room_image) || !isEmpty(eachItem.reference_room_url_thumbnail)) && (
          <FastImage
            source={{
              uri:
                eachItem.reference_room_code_id === 'YOUTUBE'
                  ? eachItem.reference_room_url_thumbnail
                  : eachItem.reference_room_image.image_full_file_path,
            }}
            style={{
              width: scale(40),
              height: scale(40),
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: '#f0f0f0',
            }}
          />
        )}
      </ListItem>
    );
  };

  useFocusEffect(
    useCallback(() => {
      //console.log('\n* ReferenceTab useFocusEffect!');
      _getReferenceList(true);
    }, [orderBy])
  );

  return (
    <BottomSheetModalProvider>
      <FlatList
        style={{flex: 1}}
        ListHeaderComponent={_renderHeader}
        data={referenceList.items}
        renderItem={_renderRhcList}
        keyExtractor={(item, index) => `notice_${index}`}
        onEndReached={() => _getReferenceList()}
        onEndReachedThreshold={0.01}
        refreshing={isLoading}
        onRefresh={() => _getReferenceList(true)}
      />

      {/************ 정렬순서 모달 랜더링 ************/}
      <BottomSheetModal
        ref={refBottomSheetFilter}
        index={0}
        snapPoints={snapFilterPoints}
        backdropComponent={backdropProps => <BottomSheetBackdrop {...backdropProps} />}>
        <View style={{padding: scale(15)}}>
          <TouchableOpacity
            style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: scale(20)}}
            onPress={() => {
              setOrderBy('최신순');
              refBottomSheetFilter.current?.dismiss();
            }}>
            <Text
              style={{
                fontSize: scale(17),
                fontWeight: orderBy === '최신순' ? 'bold' : 'normal',
                color: orderBy === '최신순' ? '#c01920' : 'black',
              }}>
              최신순 보기
            </Text>
            {orderBy === '최신순' && (
              <Icon name="ios-checkmark-sharp" type="ionicon" size={scale(25)} color="#c01920" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: scale(20)}}
            onPress={() => {
              setOrderBy('오래된순');
              refBottomSheetFilter.current?.dismiss();
            }}>
            <Text
              style={{
                fontSize: scale(17),
                fontWeight: orderBy === '오래된순' ? 'bold' : 'normal',
                color: orderBy === '오래된순' ? '#c01920' : 'black',
              }}>
              오래된순 보기
            </Text>
            {orderBy === '오래된순' && (
              <Icon name="ios-checkmark-sharp" type="ionicon" size={scale(25)} color="#c01920" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: scale(20)}}
            onPress={() => {
              setOrderBy('조회순');
              refBottomSheetFilter.current?.dismiss();
            }}>
            <Text
              style={{
                fontSize: scale(17),
                fontWeight: orderBy === '조회순' ? 'bold' : 'normal',
                color: orderBy === '조회순' ? '#c01920' : 'black',
              }}>
              조회순 보기
            </Text>
            {orderBy === '조회순' && (
              <Icon name="ios-checkmark-sharp" type="ionicon" size={scale(25)} color="#c01920" />
            )}
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default ReferenceTab;
