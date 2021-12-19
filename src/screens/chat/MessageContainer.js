/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Avatar, Bubble, SystemMessage, Message, MessageText, LoadEarlier} from 'react-native-gifted-chat';

export const renderAvatar = props => (
  <Avatar
    {...props}
    // containerStyle={{left: {borderWidth: 3, borderColor: 'red'}, right: {}}}
    imageStyle={{left: {width: 39, height: 39, borderRadius: 10}, right: {}}}
  />
);

export const renderLoadEarlier = props => <LoadEarlier {...props} label="메시지 더보기" />;

export const renderBubble = props => {
  return (
    <Bubble
      {...props}
      // renderTime={}
      // renderTicks={() => <Text>Ticks</Text>}
      // containerStyle={{
      //   left: {borderColor: 'teal', borderWidth: 8},
      //   right: {},
      // }}
      wrapperStyle={{
        left: {
          backgroundColor: props.currentMessage.user.user_no === 0 ? '#555555' : '#ededed',
          // ...(props.currentMessage.user.user_no === 0 && {
          //   borderWidth: StyleSheet.hairlineWidth,
          //   borderColor: '#c01920',
          // }),
        },
        right: {backgroundColor: '#555555'},
      }}
      // bottomContainerStyle={{
      //   left: {borderColor: 'purple', borderWidth: 4},
      //   right: {},
      // }}
      // tickStyle={{}}
      // usernameStyle={{color: 'tomato', fontWeight: '100'}}
      // containerToNextStyle={{
      //   left: {borderColor: 'navy', borderWidth: 4},
      //   right: {},
      // }}
      containerToPreviousStyle={{
        left: {
          marginLeft: 10,
          // borderTopLeftRadius: 10,
          // borderTopRightRadius: 10,
          // borderBottomLeftRadius: 10,
          // borderBottomRightRadius: 10,
        },
        // right: {
        //   borderTopLeftRadius: 10,
        //   borderTopRightRadius: 10,
        //   borderBottomLeftRadius: 10,
        //   borderBottomRightRadius: 10,
        // },
      }}
      // containerToNextStyle={{
      //   left: {
      //     borderTopLeftRadius: 10,
      //     borderTopRightRadius: 10,
      //     borderBottomLeftRadius: 10,
      //     borderBottomRightRadius: 10,
      //   },
      //   right: {
      //     borderTopLeftRadius: 10,
      //     borderTopRightRadius: 10,
      //     borderBottomLeftRadius: 10,
      //     borderBottomRightRadius: 10,
      //   },
      // }}
    />
  );
};

export const renderSystemMessage = props => (
  <SystemMessage
    {...props}
    containerStyle={{backgroundColor: '#ededed'}}
    // wrapperStyle={{borderWidth: 10, borderColor: 'white'}}
    textStyle={{color: '#222222', fontWeight: 'bold'}}
  />
);

export const renderMessage = props => (
  <Message
    {...props}
    // renderDay={() => <Text>Date</Text>}
    // containerStyle={{
    //   left: {backgroundColor: 'pink'},
    //   right: {backgroundColor: 'pink'},
    // }}
  />
);

export const renderMessageText = props => (
  <MessageText
    {...props}
    // containerStyle={{
    //   left: {backgroundColor: '#ededed'},
    //   right: {backgroundColor: '#555555'},
    // }}
    textStyle={{
      left: {color: props.currentMessage.user.user_no === 0 ? 'white' : '#222222'},
      right: {color: 'white'},
    }}
    linkStyle={{
      left: {color: 'orange'},
      right: {color: 'orange'},
    }}
    customTextStyle={{fontSize: 13, lineHeight: 17}}
  />
);

export const renderCustomView = ({user}) => (
  <View style={{minHeight: 20, alignItems: 'center'}}>
    <Text>
      Current user:
      {user.name}
    </Text>
    <Text>From CustomView</Text>
  </View>
);
