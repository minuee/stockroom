import React, {useRef, useState, useMemo, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View, FlatList} from 'react-native';
import {BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider} from '@gorhom/bottom-sheet';

import scale from '../../common/Scale';
import {addComma, screenWidth} from '../../common/Utils';

import ImageSlider from '../../screens/common/ImageSlider';

import {Icon} from 'react-native-elements';
import FastImage from 'react-native-fast-image';

import useLoading from '../../Hooks/useLoading';
import {apiObject} from '../../common/API';

const RHC_TV_Tab = ({navigation}) => {
  const refBottomSheetFilter = useRef(null);
  const snapFilterPoints = useMemo(() => ['30%'], []);

  const [innerWidth, setInnerWidth] = useState(0);
  const [rhcTvList, setRhcTvList] = useState({
    items: [],
    current_page: 0,
    next_token: undefined,
  });
  const [orderBy, setOrderBy] = useState('최신순');
  const {isLoading, setIsLoading} = useLoading();

  // 각 항목 조회수 올리기
  const _updateRhcViewCount = async rhc_no => {
    try {
      await apiObject.updateRhcViewCount({no: rhc_no});
    } catch (error) {
      console.log('🚀 ~ updateRhcViewCount= ~ error', error);
    }
  };

  // RCH TV 영상 불러오기
  const _getRhcTvList = async onRefresh => {
    //console.log('\n##_getRhcTvList');
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
          orderByData = JSON.stringify({rhc_tv_view_count: 'DESC'});
          break;

        default:
          orderByData = JSON.stringify({create_at: 'DESC'});
          break;
      }

      if (!onRefresh && !rhcTvList.next_token) {
        //console.log('no more data!');
        return;
      } else {
        const res = await apiObject.getRhcTvList(
          {
            page: onRefresh ? 1 : rhcTvList.current_page + 1,
            next_token: onRefresh ? null : rhcTvList.next_token,
            orderBy: orderByData,
          },
          setIsLoading
        );
        setRhcTvList(res);

        if (onRefresh) {
          setRhcTvList(res);
        } else {
          setRhcTvList({
            items: [...rhcTvList.items, ...res.items],
            current_page: res.current_page,
            next_token: res.next_token,
          });
        }
        // console.log('success! : ', res);
      }
    } catch (error) {
      console.log('🚀 ~ getRhcTvList = ~ error', error);
    }
  };

  // FlatList 헤더 랜더링
  const _renderHeader = () => {
    return (
      <View>
        <ImageSlider
          images={rhcTvList.items
            .filter(each => each.is_recommend)
            .map(item => {
              return {
                image_full_file_path: item.rhc_tv_url_thumbnail,
              };
            })}
          imageBoxWidth={innerWidth === 0 ? screenWidth : innerWidth}
          imageBoxHeight={scale(210)}
          imageBoxCustomStyle={{
            borderWidth: 0,
            borderRadius: 0,
          }}
          autoSlide={true}
          slideInterval={5000}
          activeIndicatorWidth={scale(30)}
          pressList={rhcTvList.items
            .filter(each => each.is_recommend)
            .map((item, index) => {
              switch (index) {
                // case 0:
                //   return null;
                // case 1:
                //   return () => props.navigation.navigate('RegisterFairInfo');
                default:
                  return () => {
                    _updateRhcViewCount(item.rhc_tv_no);
                    navigation.navigate('LinkingDetail', {linkingUrl: item.rhc_tv_url});
                  };
              }
            })}
          hasYoutubeBtn={true}
        />

        <View style={{...styles.setFlexRowDirection, marginBottom: scale(17), paddingHorizontal: scale(20)}}>
          <View style={styles.setFlexRowDirection}>
            <Text style={{fontSize: scale(16)}}>전체영상 </Text>
            <Text style={{fontSize: scale(13), color: '#999999'}}>{`(총 ${rhcTvList.items.length}건)`}</Text>
          </View>
          <TouchableWithoutFeedback onPress={() => refBottomSheetFilter.current?.present()}>
            <View style={styles.setFlexRowDirection}>
              <Text
                style={{
                  fontSize: scale(13),
                  color: '#555555',
                }}>
                {orderBy}
              </Text>
              <Icon name="ios-chevron-down" color="#555555" type="ionicon" size={scale(15)} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    );
  };

  // Flatlist 컨텐츠 랜더링
  const _renderRhcList = ({item}) => {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          _updateRhcViewCount(item.rhc_tv_no);
          navigation.navigate('RHC_Detail', {RHC_DATA: item});
        }}>
        <View style={{flexDirection: 'row', marginBottom: scale(15), paddingHorizontal: scale(20)}}>
          <FastImage
            source={{uri: item.rhc_tv_url_thumbnail}}
            style={{
              width: scale(150),
              height: scale(90),
              borderRadius: 5,
              marginRight: scale(15),
            }}
          />
          <View
            style={{
              justifyContent: 'space-around',
            }}>
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={{
                marginBottom: scale(18),
                fontSize: 15,
                maxWidth: 150,
              }}>
              {item.rhc_tv_title}
            </Text>

            <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text
                style={{
                  fontSize: 11,
                  color: '#777777',
                }}>
                {'조회수 '}
                <Text
                  style={{
                    fontSize: 11,
                    color: '#c01920',
                  }}>
                  {addComma(item.rhc_tv_view_count)}회
                </Text>
                <Text>{` •  ${item.update_at.slice(0, 10).split('-').join('.')}`}</Text>
              </Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  useFocusEffect(
    useCallback(() => {
      //console.log('\n## RHC_TV_Tab useFocusEffect! : ', rhcTvList);
      _getRhcTvList(true);
    }, [orderBy])
  );
  return (
    <BottomSheetModalProvider>
      <FlatList
        style={{flex: 1}}
        ListHeaderComponent={_renderHeader}
        data={rhcTvList.items}
        renderItem={_renderRhcList}
        keyExtractor={(item, index) => `notice_${index}`}
        onEndReached={() => _getRhcTvList()}
        onEndReachedThreshold={0.1}
        refreshing={isLoading}
        onRefresh={() => _getRhcTvList(true)}
      />

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

export default RHC_TV_Tab;

const styles = StyleSheet.create({
  setFlexRowDirection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
