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

const ConfirmProfitTab = ({navigation}) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const {isLoading, setIsLoading} = useLoading();
  const refBottomSheetFilter = useRef(null);
  const snapFilterPoints = useMemo(() => ['30%'], []);

  const [profitsList, setProfitsList] = useState({items: [], current_page: 0, next_token: undefined});
  const [orderBy, setOrderBy] = useState('최신순');

  // 수익 인증 가져오기
  const _getProfitsList = async onRefresh => {
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

      if (!onRefresh && !profitsList.next_token) {
        return;
      } else {
        const apiResultProfits = await apiObject.getProfitsList(
          {
            page: onRefresh ? 1 : profitsList.current_page + 1,
            next_token: onRefresh ? null : profitsList.next_token,
            orderBy: orderByData,
          },
          setIsLoading
        );

        if (onRefresh) {
          setProfitsList(apiResultProfits);
        } else {
          setProfitsList({
            items: [...profitsList.items, ...apiResultProfits.items],
            current_page: apiResultProfits.current_page,
            next_token: apiResultProfits.next_token,
          });
        }
        //console.log('success! : ', apiResultProfits);
      }
    } catch (error) {
      console.log('🚀 ~ _getProfitsList= ~ error', error);
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
          전체 {profitsList.items.length}건
        </Text>
        <TouchableOpacity onPress={() => refBottomSheetFilter.current?.present()}>
          <Text style={{fontSize: scale(14), color: '#555555'}}>{orderBy}⬇︎</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const _renderRhcList = props => {
    const profitsItem = props.item;
    const profitsIndex = props.index;

    return (
      <ListItem
        bottomDivider={profitsIndex !== profitsList.items.length - 1}
        key={`profit_${profitsIndex}`}
        onPress={() => navigation.navigate('ProfitDetail', {PROFIT_DATA: profitsItem})}>
        <ListItem.Content>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <ListItem.Title style={{fontSize: scale(15)}}>{profitsItem.profit_cert_title}</ListItem.Title>
            {/* {profitsItem.isNew && (
                  <FastImage
                    source={require('../../../assets/images/drawable-xxxhdpi/new_icon.png')}
                    style={{width: scale(31), height: scale(16), marginLeft: scale(5)}}
                  />
                )} */}
          </View>
          <ListItem.Subtitle style={{fontSize: scale(12)}}>{`${changeTime(
            +new Date(profitsItem.create_at) / 1000
          )} • 조회 ${addComma(profitsItem.profit_cert_view_count)}`}</ListItem.Subtitle>
        </ListItem.Content>
        {(!isEmpty(profitsItem.profit_cert_image) || !isEmpty(profitsItem.profit_cert_url_thumbnail)) && (
          <FastImage
            source={{
              uri:
                profitsItem.profit_cert_code_id === 'YOUTUBE'
                  ? profitsItem.profit_cert_url_thumbnail
                  : profitsItem.profit_cert_image.image_full_file_path,
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
      //console.log('\n## ConfirmProfitTab useFocusEffect! : ', profitsList);
      _getProfitsList(true);
    }, [orderBy])
  );

  return (
    <BottomSheetModalProvider>
      <FlatList
        style={{flex: 1}}
        ListHeaderComponent={_renderHeader}
        data={profitsList.items}
        renderItem={_renderRhcList}
        keyExtractor={(item, index) => `notice_${index}`}
        onEndReached={() => _getProfitsList()}
        onEndReachedThreshold={0.01}
        refreshing={isLoading}
        onRefresh={() => _getProfitsList(true)}
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

export default ConfirmProfitTab;
