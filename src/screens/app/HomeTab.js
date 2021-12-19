import React, {useRef, useState, useMemo, useCallback, useEffect} from 'react';
import {StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View, RefreshControl} from 'react-native';
import BottomSheet, {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {API, graphqlOperation} from 'aws-amplify';
import {useFocusEffect} from '@react-navigation/native';

import * as subscriptions from '../../common/graphql/subscriptions';

import scale from '../../common/Scale';
import {addComma, changeTime, isEmpty, isEmptyArr, screenHeight, screenWidth, YYYYMMDD} from '../../common/Utils';

import ImageSlider from '../../screens/common/ImageSlider';

import {Badge, Divider, Icon} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Animated from 'react-native-reanimated';
import TextTicker from 'react-native-text-ticker';
import useUserInfo from '../../Hooks/useUserInfo';
import {apiObject} from '../../common/API';
import useLoading from '../../Hooks/useLoading';

let subscribeRef = null;

const HomeTab = ({navigation}) => {
  const refBottomSheet = useRef(null);
  const snapPoints = useMemo(() => ['0.1%', '20%'], []);

  const {isPaid, isExit, userNo, setUserInfo, userType, isBlock} = useUserInfo();
  const scrollY = useRef(new Animated.Value(0)).current;
  const {isLoading, setIsLoading} = useLoading();

  const [innerWidth, setInnerWidth] = useState(0);

  // 최신 메시지 관련
  const [lastChatMessage, setLastChatMessage] = useState({
    createdAt: new Date(),
    text: '-',
    user: {
      avatar: 'https://i.imgur.com/mNuyraD.png',
    },
  });
  const [messageCount, setMessageCount] = useState(0);

  // 메시지 속 추천 종목 관련
  const [recommendStockData, setRecommendStockData] = useState([]);

  const [dataList, setDataList] = useState({
    noticeList: [],
    bannerList: [],
    recommendStock: {
      stock_code: {
        stock_description: undefined,
      },
      stock_recommend_time: undefined,
      stock_recommend_purchase_value: undefined,
      stock_recommend_result_percent: undefined,
      stock_recommend_result_code_id: undefined,
      update_at: new Date(),
    },
  });

  // 애니메이션 Header 관련
  const [isDeadLine, setIsDeadLine] = useState(false);

  // 배너 조회수 올리기
  const _updateBannerViewCount = async banner_no => {
    try {
      await apiObject.updateBannerViewCount({no: banner_no});
    } catch (error) {
      console.log('🚀 ~ _updateBannerViewCount= ~ error', error);
    }
  };

  // 공지사항, 배너, 마지막 메시지, 추천 종목
  const _getMainData = async () => {
    try {
      // 배너 가져오기
      const apiResultBanner = await apiObject.getBannerList();
      let bannerList = apiResultBanner.items.map(item => {
        return {
          image_full_file_path: item.banner_image.image_full_file_path,
          banner_no: item.banner_no,
          banner_url: item.banner_url,
        };
      });

      //공지사항 가져오기
      const apiResultNotice = await apiObject.getNoticeList({
        limit: 5,
        filter: JSON.stringify({and: [{is_main: true}]}),
      });
      let noticeList = apiResultNotice.items.map(item => item.notice_title);

      setDataList({...dataList, noticeList, bannerList});

      // 추천 종목 가져오기
      // 마지막 채팅 메시지 가져오기
      //_getChatHistory();
    } catch (error) {
      console.log('🚀 ~ _getMainData= ~ error', error);
    }
  };

  // 채팅 불러오기
  const _getChatHistory = async () => {
    try {
      const apiResult = await apiObject.getChatInitData({chat_room_no: isPaid ? 2 : 1});

      setLastChatMessage({
        _id: apiResult.last_chat_message.user._id,
        id: apiResult.last_chat_message.user._id,
        createdAt: new Date(),
        ...apiResult.last_chat_message,
      });

      setRecommendStockData(apiResult.recommend_stocks.items);
    } catch (error) {
      console.log('testFunction -> error', error.response.data);
      console.log('testFunction -> error', error.response.status);
    }
  };

  // 채팅 수신
  const _setChatMessage = async message_data => {
    const chat_message_content = JSON.parse(message_data.chat_message_content);

    setRecommendStockData(chat_message_content.recommend_stocks.items);

    setIsDeadLine(beforeDeadLine => {
      if (beforeDeadLine !== chat_message_content.is_deadline) {
        return chat_message_content.is_deadline;
      } else {
        return beforeDeadLine;
      }
    });

    if (chat_message_content.sender_type === 'ACTION' && chat_message_content.text !== 'EMPTY ACTION') {
      if (chat_message_content.action_info.action_type === 'EXIT') {
        if (chat_message_content.action_info.data.exit_user_no === Number(userNo)) {
          alert({
            type: 'info',
            title: '채팅방에서 강제 추방되었습니다.',
            body: '오늘은 더 이상 채팅에 참여가 불가합니다.\n내일 다시 이용해 주세요.',
            btnText: '확인',
          });

          setUserInfo({isExit: true});
          _appSyncRelease();
        }
      }
    }

    if (chat_message_content.sender_type === 'ACTION') {
      return null;
    }

    setLastChatMessage({
      createdAt: message_data.create_at,
      ...chat_message_content,
    });

    setMessageCount(beforeCount => {
      return beforeCount + 1;
    });
  };

  // 채팅방 접속
  const _appSyncInit = () => {
    if (subscribeRef) {
      return null;
    }

    subscribeRef = API.graphql(
      graphqlOperation(subscriptions.onCreateChatMessage, {
        chat_room_no: isPaid ? 2 : 1,
      })
    ).subscribe({
      error: err => {
        console.log(err.error.errors[0].message);
      },
      next: data => _setChatMessage(data.value.data.data),
    });
  };

  // 채팅방 접속 해제
  const _appSyncRelease = () => {
    if (subscribeRef) {
      subscribeRef.unsubscribe();
      subscribeRef = null;
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log('\n## HomeTab useEffect!');
      _getMainData();

      if (userType !== '일반회원' && !isExit && !isBlock) {
        _getChatHistory();
        _appSyncInit();
        setMessageCount(beforeCount => {
          if (beforeCount !== 0) {
            return 0;
          } else {
            return beforeCount;
          }
        });

        console.log('refBottomSheet!');
        setTimeout(() => {
          refBottomSheet.current.expand();
        }, 500);
      }

      //getDataAsyncFunc();

      return () => {
        _appSyncRelease();
      };
    }, [isExit])
  );

  // 데이터 불러오기 비동기 처리
  const getDataAsyncFunc = async () => {
    await _getMainData();
    await _getChatHistory();

    if (userType !== '일반회원' && !isExit && !isBlock) {
      await _appSyncInit();
      await setMessageCount(beforeCount => {
        if (beforeCount !== 0) {
          return 0;
        } else {
          return beforeCount;
        }
      });

      console.log('refBottomSheet!');
      if (refBottomSheet) {
        refBottomSheet.current.expand();
      }
    }
  };

  return (
    <BottomSheetModalProvider>
      <Animated.ScrollView
        style={{backgroundColor: '#f5f5f5'}}
        onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
          useNativeDriver: true,
        })}
        bounces={false}
        refreshControl={<RefreshControl onRefresh={() => getDataAsyncFunc()} refreshing={isLoading} />}
        scrollEventThrottle={16}
        contentContainerStyle={{padding: scale(15)}}>
        {/* 블랙 공지사항 영역 */}
        {!isEmptyArr(dataList.noticeList) && (
          <TouchableOpacity
            style={{...styles.viewNoticeArea}}
            onLayout={e => setInnerWidth(e.nativeEvent.layout.width)}
            onPress={() => navigation.navigate('Notice')}>
            <FastImage
              source={require('../../../assets/images/drawable-xxxhdpi/notice_icon.png')}
              style={{width: scale(14), height: scale(11)}}
            />
            <View style={{flex: 1, marginHorizontal: scale(10)}}>
              <TextTicker
                style={{fontSize: scale(12.5), color: 'white'}}
                duration={dataList.noticeList.length * 5000}
                marqueeDelay={500}>
                {dataList.noticeList.map((noticeItem, noticeIndex) => (
                  <Text key={`notice_${noticeIndex}`}>
                    {noticeItem}
                    {'                    '}
                  </Text>
                ))}
              </TextTicker>
            </View>
            <Icon name="ios-chevron-forward" type="ionicon" color="white" />
          </TouchableOpacity>
        )}
        {/* ------ */}

        {/* 이미지 슬라이더 영역 */}
        {!isEmptyArr(dataList.bannerList) && (
          <View style={{marginVertical: scale(20)}}>
            <ImageSlider
              images={dataList.bannerList}
              imageBoxWidth={innerWidth === 0 ? screenWidth * 0.915 : innerWidth}
              imageBoxHeight={scale(120)}
              autoSlide={true}
              slideInterval={5000}
              activeIndicatorWidth={scale(30)}
              pressList={dataList.bannerList.map((item, index) => {
                switch (index) {
                  // case 0:
                  //   return null;
                  // case 1:
                  //   return () => props.navigation.navigate('RegisterFairInfo');
                  default:
                    return () => {
                      _updateBannerViewCount(item.banner_no);
                      navigation.navigate('LinkingDetail', {linkingUrl: item.banner_url});
                    };
                }
              })}
            />
          </View>
        )}
        {/* ------- */}

        {/* 추천 종목 영역 */}
        <View style={{backgroundColor: 'white', borderRadius: scale(10)}}>
          <View
            style={{
              backgroundColor: '#e6e6e6',
              borderRadius: scale(5),
              flexDirection: 'row',
              justifyContent: 'space-between',
              margin: scale(10),
              marginBottom: 0,
              paddingVertical: scale(5),
            }}>
            <Text style={{flex: 1, textAlign: 'center', fontSize: scale(12), fontWeight: 'bold'}}>종목명</Text>
            <Text style={{flex: 1, textAlign: 'center', fontSize: scale(12), fontWeight: 'bold'}}>주가</Text>
            <Text style={{flex: 1, textAlign: 'center', fontSize: scale(12), fontWeight: 'bold'}}>수익률</Text>
          </View>

          {recommendStockData.map((item, index) => (
            <View key={`stock_${index}`}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginHorizontal: scale(10),
                  paddingVertical: scale(10),
                }}>
                <View style={{flex: 1, alignItems: 'center'}}>
                  <Text>{item.stock_name}</Text>
                  <Text>{changeTime(+new Date(item.create_at) / 1000)}</Text>
                </View>
                <View style={{flex: 1, alignItems: 'center'}}>
                  <Text>{addComma(item.stock_recommend_purchase_value)} (추천가)</Text>
                  <Text>
                    {isEmpty(item.stock_recommend_result_percent)
                      ? '-'
                      : `${addComma(
                          Math.round(
                            item.stock_recommend_purchase_value * (1 + item.stock_recommend_result_percent / 100)
                          )
                        )} (종료가)`}
                  </Text>
                </View>
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                  <Text
                    style={{
                      fontSize: scale(16),
                      fontWeight: 'bold',
                      color: item.stock_recommend_result_percent > 0 ? '#ec2f37' : '#1e79ef',
                    }}>
                    {isEmpty(item.stock_recommend_result_percent) ? '-' : `${item.stock_recommend_result_percent}%`}
                  </Text>
                </View>
              </View>
              <Divider style={{backgroundColor: '#dddddd'}} />
            </View>
          ))}

          {isEmptyArr(recommendStockData) && (
            <View style={{alignItems: 'center', margin: scale(10)}}>
              <Text style={{fontSize: scale(15)}}>아직 추천 종목이 없군요 :)</Text>
              <Text style={{fontSize: scale(15)}}>종목추천은 월-금 오전 9시부터 진행됩니다.</Text>
            </View>
          )}
        </View>
        {/* ------- */}
        <View style={{height: screenHeight * 0.1}} />
      </Animated.ScrollView>

      {/************ 하단 RSBC 체험방 모달 ************/}
      {refBottomSheet && userType !== '일반회원' && !isExit && !isBlock && (
        <BottomSheet
          ref={refBottomSheet}
          index={0}
          snapPoints={snapPoints}
          handleComponent={() => (
            <TouchableWithoutFeedback
              onPress={() => {
                _appSyncRelease();
                refBottomSheet.current.close();
                setTimeout(() => {
                  navigation.navigate('ChatMain');
                }, 300);
              }}>
              <View style={{...styles.viewBottomSheetHeader}}>
                <Text style={{...styles.txtBottomSheetHeaderTitle}}>
                  {userType === '유료회원' ? 'RSBC 구매자방' : 'RSBC 체험방'}
                </Text>
                <Icon name="ios-chevron-up" type="ionicon" size={scale(25)} />
              </View>
            </TouchableWithoutFeedback>
          )}>
          <TouchableWithoutFeedback
            onPress={() => {
              _appSyncRelease();
              refBottomSheet.current.close();
              setTimeout(() => {
                navigation.navigate('ChatMain');
              }, 500);
            }}>
            <View style={{flex: 1, backgroundColor: 'white'}}>
              {!isEmptyArr(recommendStockData) && (
                <View style={{...styles.viewRecommendArea}}>
                  <Text style={{...styles.txtRecommendText}}>
                    {isEmpty(recommendStockData[0].update_at)
                      ? '-'
                      : YYYYMMDD(+new Date(recommendStockData[0].update_at) / 1000)}
                  </Text>
                  <Text style={{...styles.txtRecommendText}}>
                    {isEmpty(recommendStockData[0].stock_name) ? '-' : recommendStockData[0].stock_name}
                  </Text>
                  <Text style={{...styles.txtRecommendText}}>
                    {isEmpty(recommendStockData[0].stock_recommend_purchase_value)
                      ? '-'
                      : recommendStockData[0].stock_recommend_purchase_value}
                  </Text>
                  <Text style={{...styles.txtRecommendText}}>
                    {isEmpty(recommendStockData[0].stock_recommend_result_percent)
                      ? '-'
                      : `${recommendStockData[0].stock_recommend_result_percent}%`}
                  </Text>
                  <Text style={{...styles.txtRecommendResult(recommendStockData[0].stock_recommend_result_code_id)}}>
                    {isEmpty(recommendStockData[0].stock_recommend_result_code_id)
                      ? '-'
                      : recommendStockData[0].stock_recommend_result_code_id}
                  </Text>
                </View>
              )}
              <View style={{...styles.viewTalkArea}}>
                <FastImage
                  source={{uri: lastChatMessage.user.avatar}}
                  style={{width: scale(40), height: scale(40), borderRadius: scale(10)}}
                  resizeMode={FastImage.resizeMode.stretch}
                />
                <Text style={{...styles.txtTalkContent}} numberOfLines={2}>
                  {lastChatMessage.type === 'IMAGE' ? '(사진)' : lastChatMessage.text}
                </Text>
                <View style={{alignItems: 'center'}}>
                  <Text style={{...styles.txtRecommendText, fontWeight: 'bold'}}>
                    {changeTime(+new Date(lastChatMessage.createdAt) / 1000)}
                  </Text>
                  {messageCount !== 0 && (
                    <Badge
                      status="error"
                      value={messageCount > 99 ? '99+' : messageCount}
                      badgeStyle={{paddingHorizontal: scale(3)}}
                    />
                  )}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </BottomSheet>
      )}
    </BottomSheetModalProvider>
  );
};

export default HomeTab;

const styles = StyleSheet.create({
  viewNoticeArea: {
    borderRadius: scale(4),
    backgroundColor: '#222222',
    padding: scale(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewBottomSheetHeader: {
    borderTopLeftRadius: scale(15),
    borderTopRightRadius: scale(15),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: scale(15),
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 16,
  },
  txtBottomSheetHeaderTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
  },
  txtRecommendText: {
    fontSize: scale(12),
  },
  viewRecommendArea: {
    flexDirection: 'row',
    backgroundColor: '#fdc429',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(15),
    paddingVertical: scale(5),
  },
  txtRecommendResult: resultInfo => ({
    backgroundColor: isEmpty(resultInfo)
      ? null
      : resultInfo === '수익종료' || resultInfo === '상한가'
      ? '#ec2f37'
      : '#1e79ef',
    color: 'white',
    borderRadius: scale(7),
    fontSize: scale(9),
    padding: scale(2),
  }),
  viewTalkArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(15),
  },
  txtTalkContent: {
    flex: 1,
    fontSize: scale(12),
    color: '#222222',
    marginHorizontal: scale(10),
  },
});
