import React, {useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View, Image} from 'react-native';

import scale from '../../common/Scale';
import {changeTime} from '../../common/Utils';

import {Divider, Header} from 'react-native-elements';
import YoutubePlayer from 'react-native-youtube-iframe';
import FastImage from 'react-native-fast-image';
import ImageModal from 'react-native-image-modal';

const ReferenceDetail = props => {
  const REFERENCE_DATA = props.route.params.REFERENCE_DATA;

  const [imageInfo, setImageInfo] = useState(null);

  const getImageRatio = url => {
    return new Promise(resolve => {
      Image.getSize(
        url,
        (width, height) =>
          resolve({
            width,
            height,
          }),
        () => resolve(1)
      );
    });
  };

  const getImageInfo = async () => {
    const info = await getImageRatio(REFERENCE_DATA.reference_room_image.image_full_file_path);

    setImageInfo(info);
  };

  useEffect(() => {
    getImageInfo();
    console.log('\n* ReferenceDetail : ', REFERENCE_DATA);
  }, []);

  const _renderContent = () => {
    switch (REFERENCE_DATA.reference_room_code_id) {
      case 'YOUTUBE':
        return <YoutubePlayer height={scale(250)} videoId={REFERENCE_DATA.reference_room_url_youtube_id} />;

      case 'IMAGE':
        return (
          <View
            style={{
              height: scale(360 * (imageInfo.height / imageInfo.width)),
              width: '100%',
              // flex: 1,
              marginBottom: scale(20),
            }}>
            <FastImage
              resizeMode="cover"
              source={{uri: REFERENCE_DATA.reference_room_image.image_full_file_path}}
              style={{
                width: '100%',
                height: '100%',
              }}
              // resizeMode={FastImage.resizeMode.contain}
            />
          </View>
        );

      default:
        return null;
    }
  };

  const content = () => {
    return (
      <View style={{...styles.viewInner}}>
        <Text style={{fontSize: scale(12), color: '#999999'}}>
          {changeTime(+new Date(REFERENCE_DATA.create_at) / 1000)} • 조회{' '}
          {Number(REFERENCE_DATA.reference_room_view_count) + 1}회
        </Text>
        <Divider style={{marginVertical: scale(10)}} />
        {_renderContent()}
        <Text style={{fontSize: scale(14), color: '#555555'}}>{REFERENCE_DATA.reference_room_content}</Text>
      </View>
    );
  };

  return (
    <View style={{...styles.container}}>
      <Header
        backgroundColor="transparent"
        statusBarProps={{translucent: true, backgroundColor: 'transparent', barStyle: 'dark-content', animated: true}}
        leftComponent={{
          icon: 'ios-chevron-back',
          type: 'ionicon',
          size: scale(40),
          color: 'black',
          onPress: () => props.navigation.goBack(null),
        }}
        centerComponent={<Text style={{fontSize: scale(18)}}>{REFERENCE_DATA.reference_room_title}</Text>}
        centerContainerStyle={{justifyContent: 'center'}}
        containerStyle={{borderBottomWidth: 0}}
        placement="left"
      />
      <SafeAreaView style={{...styles.contents}}>
        <ScrollView>
          {REFERENCE_DATA.reference_room_code_id !== 'IMAGE' && content()}
          {REFERENCE_DATA.reference_room_code_id === 'IMAGE' && imageInfo && content()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default ReferenceDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  viewInner: {
    padding: scale(15),
    paddingTop: 0,
  },
});
