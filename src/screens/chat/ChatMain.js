import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, SafeAreaView} from 'react-native';

import scale from '../../common/Scale';
import {changeTime, isEmpty, isEmptyArr} from '../../common/Utils';
import useAlert from '../../Hooks/useAlert';
import useUserInfo from '../../Hooks/useUserInfo';
import useLoading from '../../Hooks/useLoading';

import {renderInputToolbar, renderActions, renderComposer, renderSend} from './InputToolbar';
import {
  renderAvatar,
  renderBubble,
  renderSystemMessage,
  renderMessage,
  renderMessageText,
  renderCustomView,
  renderLoadEarlier,
} from './MessageContainer';

import {Divider, Header, Icon} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import {GiftedChat} from 'react-native-gifted-chat';
import {BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import 'dayjs/locale/ko';
import {API, graphqlOperation} from 'aws-amplify';
import {Api} from '@psyrenpark/api';
import Toast from 'react-native-simple-toast';

import * as subscriptions from '../../common/graphql/subscriptions';
import * as mutations from '../../common/graphql/mutations';
import * as queries from '../../common/graphql/queries';

import {apiObject} from '../../common/API';

let subscribeRef = null;
let connectionPoolingRef = null;
let timeNowRef = null;

const ChatMain = props => {
  const alert = useAlert();

  const {isLoading, setIsLoading} = useLoading();
  const {isPaid, userNo, userNickName, userImage, blockList, setUserInfo, userType} = useUserInfo();

  const refUserInfoBottomSheetModal = useRef(null);
  const snapPoints = useMemo(() => ['18%'], []);

  const [realTimeDate, setRealTimeDate] = useState(new Date().toLocaleString());
  const [realTimeOnline, setRealTimeOnline] = useState(1);

  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [nextToken, setNextToken] = useState('');
  const [avatarData, setAvatarData] = useState({});
  const [isDeadLine, setIsDeadLine] = useState(false);
  const [recommandStockList, setRecommandStockList] = useState([]);

  // 채팅 형식 지정
  const _generateMessage = message_data => {
    const chat_message_content = JSON.parse(message_data.chat_message_content);

    return {
      _id: message_data.chat_message_no,
      id: message_data.chat_message_no,
      createdAt: message_data.create_at,
      ...chat_message_content,
    };
  };

  // 채팅 불러오기
  const _getChatHistory = async () => {
    try {
      const {
        data: {data},
      } = await Api.graphql(
        {
          query: queries.getChatHistory,
          variables: {
            input: {
              chat_room_no: isPaid ? 2 : 1,
              limit: 20,
              orderBy: {chat_message_no: 'DESC'},
            },
          },
        },
        {},
        setIsLoading
      );

      const apiResult = await apiObject.getChatInitData({chat_room_no: isPaid ? 2 : 1});

      setRecommandStockList(apiResult.recommend_stocks.items);
      setIsDeadLine(apiResult.is_deadline);
      setRealTimeOnline(apiResult.chat_connection_count);

      // 차단 유저를 제외하여 대화 목록 반영
      const messageHistoryIgnoreBlockList = data.items.flatMap(item => {
        if (blockList.some(blockUserItem => Number(blockUserItem.ignore_user_no) === item.input_user_no)) {
          return [];
        } else {
          return _generateMessage(item);
        }
      });

      setMessages(messageHistoryIgnoreBlockList);
      setNextToken(data.next_token);
      _appSyncInit();
    } catch (error) {
      console.log('testFunction -> error', error.response.data);
      console.log('testFunction -> error', error.response.status);
    }
  };

  // 채팅 더 불러오기
  const _getChatHistoryMore = async () => {
    try {
      const {
        data: {data},
      } = await Api.graphql(
        {
          query: queries.getChatHistory,
          variables: {
            input: {
              chat_room_no: isPaid ? 2 : 1,
              limit: 20,
              orderBy: {chat_message_no: 'DESC'},
              next_token: nextToken,
            },
          },
        },
        {},
        setIsLoading
      );

      // 차단 유저를 제외하여 대화 목록 반영
      const messageHistoryIgnoreBlockList = data.items.flatMap(item => {
        if (blockList.some(blockUserItem => Number(blockUserItem.ignore_user_no) === item.input_user_no)) {
          return [];
        } else {
          return _generateMessage(item);
        }
      });

      setMessages(previousMessages => GiftedChat.prepend(previousMessages, messageHistoryIgnoreBlockList));

      setNextToken(data.next_token);
    } catch (error) {
      console.log('testFunction -> error', error.response.data);
      console.log('testFunction -> error', error.response.status);
    }
  };

  // 채팅 수신
  const _setChatMessage = async message_data => {
    const chat_message_content = JSON.parse(message_data.chat_message_content);
    console.log('log -> ---------------------------------------------------');
    console.log('log -> ~ chat_message_content', chat_message_content);
    console.log('log -> ---------------------------------------------------');

    setRealTimeOnline(beforeCount => {
      if (beforeCount !== chat_message_content.chat_connection_count) {
        return chat_message_content.chat_connection_count;
      } else {
        return beforeCount;
      }
    });

    setIsDeadLine(beforeDeadLine => {
      if (beforeDeadLine !== chat_message_content.is_deadline) {
        return chat_message_content.is_deadline;
      } else {
        return beforeDeadLine;
      }
    });

    setRecommandStockList(beforeStockList => {
      if (beforeStockList !== chat_message_content.recommend_stocks.items) {
        return chat_message_content.recommend_stocks.items;
      } else {
        return beforeStockList;
      }
    });

    if (chat_message_content.sender_type === 'ACTION' && chat_message_content.text !== 'EMPTY ACTION') {
      if (chat_message_content.action_info.action_type === 'DELETE') {
        setMessages(prevMessage => {
          let _messages = prevMessage;

          for (let index = 0; index < _messages.length; index++) {
            let element = _messages[index];
            if (element.id === Number(chat_message_content.action_info.data.chat_message_no)) {
              let elementTemp = {
                ...element,
                text: chat_message_content.text,
              };

              _messages[index] = JSON.parse(JSON.stringify(elementTemp));

              break;
            }
          }

          return GiftedChat.prepend([], _messages);
        });
      }

      if (chat_message_content.action_info.action_type === 'EXIT') {
        if (chat_message_content.action_info.data.exit_user_no === Number(userNo)) {
          alert({
            type: 'info',
            title: '채팅방에서 강제 추방되었습니다.',
            body: '오늘은 더 이상 채팅에 참여가 불가합니다.\n내일 다시 이용해 주세요.',
            btnText: '확인',
            btnPress: () => props.navigation.goBack(null),
          });
          setUserInfo({isExit: true});
        }
      }
    }

    chat_message_content.sender_type !== 'ACTION' &&
      !blockList.some(blockUserItem => blockUserItem.ignore_user_no === chat_message_content.user._id) &&
      setMessages(previousMessages => GiftedChat.append(previousMessages, [_generateMessage(message_data)]));
  };

  // 채팅방 접속
  const _appSyncInit = () => {
    console.log('chat useEffect init');

    if (subscribeRef) {
      return;
    }

    subscribeRef = API.graphql(
      graphqlOperation(subscriptions.onCreateChatMessage, {
        chat_room_no: isPaid ? 2 : 1,
      })
    ).subscribe({
      next: data => _setChatMessage(data.value.data.data),
    });

    connectionPoolingRef = setInterval(() => {
      _updateChatConnection();
    }, 30000);

    timeNowRef = setInterval(() => {
      setRealTimeDate(new Date().toLocaleString());
    }, 1000);
  };

  // 채팅방 주기적 풀링
  const _updateChatConnection = async () => {
    try {
      await apiObject.updateChatConnection({chat_room_no: isPaid ? 2 : 1});
    } catch (error) {
      console.log('changePasswordFunction -> error.code', error.code);
      console.log('changePasswordFunction -> error.name', error.name);
      console.log('changePasswordFunction -> error.message', error.message);
    }
  };

  // 채팅방 연결종료시
  const _quitChatConnection = async () => {
    try {
      await apiObject.quitChatConnection({chat_room_no: isPaid ? 2 : 1});
    } catch (error) {
      console.log('changePasswordFunction -> error.code', error.code);
      console.log('changePasswordFunction -> error.name', error.name);
      console.log('changePasswordFunction -> error.message', error.message);
    }
  };

  // 채팅방 접속 해제
  const _appSyncRelease = () => {
    if (subscribeRef) {
      console.log('chat useEffect release');
      subscribeRef.unsubscribe();
      subscribeRef = null;
    }
  };

  // 차단 유저 리스트
  const _listIgnoreToUserList = async () => {
    try {
      const apiResult = await apiObject.listIgnoreToUserList();

      setUserInfo({blockList: apiResult.items});
    } catch (error) {
      console.log('🚀 ~ _listIgnoreToUserList= ~ error', error);
    }
  };

  // 유저 차단/차단 해제
  const _setIgnoreToUser = async (ignore_user_no, flag) => {
    try {
      const apiResult = await apiObject.setIgnoreToUser({ignore_user_no, flag});

      setUserInfo({blockList: apiResult.items});
    } catch (error) {
      console.log('🚀 ~ _setIgnoreToUser= ~ error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  useEffect(() => {
    _getChatHistory();
    _listIgnoreToUserList();

    return () => {
      _appSyncRelease();
      _quitChatConnection();
      if (connectionPoolingRef) {
        clearInterval(connectionPoolingRef);
        clearInterval(timeNowRef);
      }
    };
  }, []);

  // 메시지 전송
  const _sendMessage = async newMessage => {
    const messageData = {
      type: 'TEXT',
      text: newMessage[0].text,
    };

    try {
      await Api.graphql({
        query: mutations.sendMessage,
        variables: {
          input: {
            chat_room_no: isPaid ? 2 : 1,
            chat_message_type_code_id: 'DEFAULT',
            chat_message_content: JSON.stringify(messageData),
          },
        },
      });

      // setMessages(prevMessages => GiftedChat.append(prevMessages, newMessage));
    } catch (error) {
      console.log('🚀 _sendMessage ~ error', error.response[0]);
      if (error.response[0].errorType === 'INCLUDE_CHAT_BAN_WORD') {
        Toast.show('채팅에 금지된 단어가 포함되어있습니다.', Toast.SHORT);
      }
    }
  };

  // 메시지 전송
  const onSend = (newMessages = []) => {
    _sendMessage(newMessages);
  };

  return (
    <BottomSheetModalProvider>
      <View style={{...styles.container}}>
        <Header
          backgroundColor="#c01920"
          statusBarProps={{
            translucent: true,
            backgroundColor: 'transparent',
            barStyle: 'light-content',
            animated: true,
          }}
          centerComponent={
            <View style={{flexDirection: 'row'}}>
              <Text style={{fontSize: scale(25), fontWeight: 'bold', color: 'white', marginRight: scale(10)}}>
                {userType === '유료회원' ? 'RSBC 구매자방' : 'RSBC 체험방'}
              </Text>
              <TouchableOpacity onPress={() => props.navigation.navigate('Inquire')}>
                <FastImage
                  source={
                    isDeadLine
                      ? require('../../../assets/images/drawable-xxxhdpi/alarm_icon.png')
                      : require('../../../assets/images/drawable-xxxhdpi/help_white_icon.png')
                  }
                  style={{width: scale(40), height: scale(40)}}
                />
              </TouchableOpacity>
            </View>
          }
          placement="left"
          rightComponent={{
            icon: 'ios-chevron-down',
            type: 'ionicon',
            size: scale(35),
            color: 'white',
            onPress: () => props.navigation.goBack(null),
          }}
          containerStyle={{borderBottomWidth: 0}}
        />
        <SafeAreaView style={{...styles.contents}}>
          <View style={{...styles.viewActiveArea}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon
                name="ios-person-outline"
                type="ionicon"
                color="white"
                size={scale(15)}
                style={{marginRight: scale(5)}}
              />
              <Text style={{fontSize: scale(13), color: 'white'}}>{realTimeOnline}명 참여중</Text>
            </View>
            <Text style={{fontSize: scale(13), color: 'white'}}>{realTimeDate}</Text>
          </View>
          {!isEmptyArr(recommandStockList) && (
            <View style={{...styles.viewTableHeader}}>
              <View style={{flex: 1, alignItems: 'center'}}>
                <Text style={{...styles.txtTableHeader}}>추천시간</Text>
              </View>
              <View style={{flex: 1.5}}>
                <Text style={{...styles.txtTableHeader}}>종목명</Text>
              </View>
              <View style={{flex: 1, alignItems: 'center'}}>
                <Text style={{...styles.txtTableHeader}}>추천매수가</Text>
              </View>
              <View style={{flex: 1, alignItems: 'center'}}>
                <Text style={{...styles.txtTableHeader}}>결과</Text>
              </View>
              <View style={{flex: 1}}>
                <Text />
              </View>
            </View>
          )}
          {recommandStockList.map((stockItem, stockIndex) => (
            <TouchableOpacity
              key={`stockList_${stockIndex}`}
              style={{...styles.viewTableRows}}
              onPress={() => props.navigation.navigate('ChartMain', {stock_code_no: stockItem.stock_code_no})}>
              <View style={{flex: 1, alignItems: 'center'}}>
                <Text style={{...styles.txtTableRows}}>{changeTime(+new Date(stockItem.update_at) / 1000)}</Text>
              </View>
              <View style={{flex: 1.5}}>
                <Text style={{...styles.txtTableRows}}>
                  {isEmpty(stockItem.stock_name) ? '-' : stockItem.stock_name}
                </Text>
              </View>
              <View style={{flex: 1, alignItems: 'center'}}>
                <Text style={{...styles.txtTableRows}}>
                  {isEmpty(stockItem.stock_recommend_purchase_value) ? '-' : stockItem.stock_recommend_purchase_value}
                </Text>
              </View>
              <View style={{flex: 1, alignItems: 'center'}}>
                <Text style={{...styles.txtTableRows}}>
                  {isEmpty(stockItem.stock_recommend_result_percent)
                    ? '-'
                    : `${stockItem.stock_recommend_result_percent}%`}
                </Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={{...styles.txtRecommendResult(stockItem.stock_recommend_result_code_id)}}>
                  {isEmpty(stockItem.stock_recommend_result_code_id) ? '-' : stockItem.stock_recommend_result_code_id}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          <GiftedChat
            // isTyping={true}
            locale="ko"
            messages={messages}
            text={text}
            onInputTextChanged={setText}
            onSend={onSend}
            user={{
              _id: userNo,
              user_no: userNo,
              name: userNickName,
              avatar: userImage.image_full_file_path,
            }}
            alignTop
            alwaysShowSend
            scrollToBottom
            scrollToBottomStyle={{borderColor: '#aaaaaa', borderWidth: StyleSheet.hairlineWidth}}
            // showUserAvatar
            renderAvatarOnTop
            renderUsernameOnMessage
            // bottomOffset={26}
            onPressAvatar={avatarInfo => {
              setAvatarData(avatarInfo);
              avatarInfo._id !== 0 && refUserInfoBottomSheetModal.current?.present();
            }}
            renderInputToolbar={renderInputToolbar}
            // renderActions={renderActions}
            renderComposer={renderComposer}
            renderSend={renderSend}
            renderAvatar={renderAvatar}
            renderBubble={renderBubble}
            renderSystemMessage={renderSystemMessage}
            renderMessage={renderMessage}
            renderMessageText={renderMessageText}
            // renderMessageImage
            // renderCustomView={renderCustomView}
            // isCustomViewBottom
            messagesContainerStyle={{backgroundColor: '#fafafa'}}
            parsePatterns={linkStyle => [
              {
                pattern: /#(\w+)/,
                style: linkStyle,
                onPress: tag => console.log(`Pressed on hashtag: ${tag}`),
              },
            ]}
            placeholder="채팅입력..."
            keyboardShouldPersistTaps={'handled'}
            // infiniteScroll={true}
            loadEarlier={!isEmpty(nextToken)}
            isLoadingEarlier={isLoading}
            onLoadEarlier={_getChatHistoryMore}
            renderLoadEarlier={renderLoadEarlier}
          />
        </SafeAreaView>
        <BottomSheetModal
          ref={refUserInfoBottomSheetModal}
          index={0}
          snapPoints={snapPoints}
          handleComponent={handleProps => (
            <View {...handleProps} style={{alignItems: 'center'}}>
              <FastImage
                source={{uri: avatarData.avatar}}
                style={{
                  width: scale(78),
                  height: scale(78),
                  borderRadius: scale(20),
                  top: -(scale(78) / 4),
                }}
                resizeMode={FastImage.resizeMode.stretch}
              />
            </View>
          )}
          backdropComponent={backdropProps => <BottomSheetBackdrop {...backdropProps} />}>
          <View>
            <Text style={{textAlign: 'center', fontSize: scale(19), fontWeight: 'bold'}}>{avatarData.name}</Text>
            <Divider style={{marginVertical: scale(20)}} />
            <TouchableOpacity
              style={{alignItems: 'center'}}
              onPress={() => {
                blockList.some(blockUserItem => blockUserItem.ignore_user_no === avatarData.user_no)
                  ? _setIgnoreToUser(avatarData.user_no, false)
                  : _setIgnoreToUser(avatarData.user_no, true);
              }}>
              <Icon name="circle-slash" type="octicon" size={scale(25)} color="#888888" />
              <Text style={{fontSize: scale(13), color: '#555555'}}>
                {blockList.some(blockUserItem => blockUserItem.ignore_user_no === avatarData.user_no)
                  ? '차단 해제'
                  : '차단'}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

export default ChatMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  viewActiveArea: {
    backgroundColor: '#c01920',
    paddingHorizontal: scale(20),
    paddingBottom: scale(15),
  },
  viewTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9e9e9',
    borderBottomColor: '#999999',
    borderBottomWidth: scale(1),
  },
  txtTableHeader: {
    fontSize: scale(11),
    color: '#555555',
  },
  viewTableRows: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomColor: '#999999',
    borderBottomWidth: scale(1),
  },
  txtTableRows: {
    fontSize: scale(12),
    color: 'black',
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
    textAlign: 'center',
  }),
});
