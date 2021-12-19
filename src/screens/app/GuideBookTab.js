import React from 'react';
import {SafeAreaView, ScrollView, TouchableWithoutFeedback, StyleSheet, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {Divider, Icon} from 'react-native-elements';
import scale from '../../common/Scale';

const GuideBookTab = props => {
  return (
    <ScrollView bounces={false} style={{backgroundColor: '#f9f9f9'}}>
      <View style={{...styles.container}}>
        <SafeAreaView>
          {/* 상단 메인 이미지 영역 */}
          <View
            style={{
              width: scale(320),
              height: scale(305),
              borderRadius: 5,
              backgroundColor: '#1b3785',
              alignItems: 'center',
              marginBottom: scale(15),
            }}>
            <FastImage
              source={require('../../../assets/images/drawable-xxxhdpi/guideBookMain.png')}
              style={{
                width: scale(320),
                height: scale(305),
                position: 'absolute',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  marginTop: scale(20),
                  fontSize: scale(25),
                  color: '#ffffff',
                  fontWeight: 'bold',
                }}>
                RSBC 검색식 알아보기
              </Text>
              <Divider style={{marginVertical: scale(11), width: 15, borderWidth: 1, borderColor: '#ffffff'}} />
              <Text
                style={{
                  width: 250,
                  textAlign: 'center',
                  fontSize: scale(12),
                  color: '#ffffff',
                }}>
                효율적인 매매가 가능한 RSBC검색식에 대해 알아보세요.
              </Text>
              <TouchableWithoutFeedback style={{}}>
                <Text
                  onPress={() => {
                    props.navigation.navigate('GuideDetailSearch');
                  }}
                  style={{
                    fontSize: scale(10),
                    padding: 10,
                    fontWeight: 'bold',
                    color: '#ffffff',
                    textDecorationLine: 'underline',
                  }}>
                  자세히보기
                </Text>
              </TouchableWithoutFeedback>
            </FastImage>
          </View>

          {/* 하단 2개 버튼 영역 */}
          <TouchableWithoutFeedback
            onPress={() => {
              props.navigation.navigate('GuideDetailPackage');
            }}>
            <View style={styles.bottomBtn}>
              <FastImage
                source={require('../../../assets/images/drawable-xxxhdpi/giftImg.png')}
                style={styles.bottomBtnImg}
              />
              <View>
                <Text style={styles.bottomBtnTitle}>검색식 패키지</Text>
                <Text style={styles.bottomBtnTxt}>RSBC 검색식 패키지에 대해 알아보세요.</Text>
              </View>
              <Icon type="ionicon" size={scale(15)} name="chevron-forward-outline" color="#747780" />
            </View>
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback
            onPress={() => {
              props.navigation.navigate('GuideDetailCaution');
            }}>
            <View style={styles.bottomBtn}>
              <FastImage
                source={require('../../../assets/images/drawable-xxxhdpi/cautionImg.png')}
                style={styles.bottomBtnImg}
              />
              <View>
                <Text style={styles.bottomBtnTitle}>주의사항</Text>
                <Text style={styles.bottomBtnTxt}>검색식 이용시, 주의할 점을 확인해 보세요.</Text>
              </View>
              <Icon type="ionicon" size={scale(15)} name="chevron-forward-outline" color="#747780" />
            </View>
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </View>
    </ScrollView>
  );
};

export default GuideBookTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f9f9f9',
    paddingVertical: scale(15),
    paddingHorizontal: scale(20),
  },

  // 하단 2개 버튼(검색식 패키지, 주의사항)
  bottomBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: scale(15),
    height: scale(105),
    borderRadius: 5,
    backgroundColor: '#ffffff',

    //borderColor: '#f9f9f9',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },

  bottomBtnImg: {
    width: scale(90),
    height: scale(67),
  },
  bottomBtnTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: scale(7),
  },
  bottomBtnTxt: {
    width: 150,
    fontSize: 10,
    color: '#555555',
  },
});
