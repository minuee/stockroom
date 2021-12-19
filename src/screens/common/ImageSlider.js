import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, View, ScrollView, TouchableOpacity} from 'react-native';

import scale from '../../common/Scale';
import {screenHeight, isIOS, screenWidth} from '../../common/Utils';

import {Badge} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import PropTypes from 'prop-types';

const ImageSlider = ({
  images,
  imageBoxHeight,
  imageBoxWidth,
  imageBoxCustomStyle, // 이미지 슬라이드 박스 커스텀 스타일
  activeBadgeColor,
  autoSlide,
  pressList,
  slideInterval,
  indicatorWidth,
  activeIndicatorWidth,
  indicatorCustomStyle, // 인덱스 점 영역 커스텀 스타일
  eachIndicatorCustomStyle, // 각 인덱스 점 커스텀 스타일
  hasYoutubeBtn = false, // 유튜브 버튼 포함 여부. RHC TV Tab 에서만 사용
}) => {
  const refImageSlide = useRef(null);

  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    let autoSlideInterval;
    let index = 0;
    const _autoSlide = () => {
      refImageSlide.current.scrollTo({x: imageBoxWidth * index, animated: true});
      setPageIndex(index);
      index++;
      if (index === images.length) {
        index = 0;
      }
    };
    if (autoSlide && images.length > 1) {
      autoSlideInterval = setInterval(_autoSlide, slideInterval);
    }
    return () => {
      clearInterval(autoSlideInterval);
    };
  }, [autoSlide, images, slideInterval, imageBoxWidth]);

  return (
    <View style={{...styles.container}}>
      <ScrollView
        ref={refImageSlide}
        bounces={true}
        horizontal={true}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={({nativeEvent}) => setPageIndex(Math.round(nativeEvent.contentOffset.x / imageBoxWidth))}
        snapToInterval={imageBoxWidth}
        decelerationRate="fast"
        scrollEventThrottle={16}>
        {images.map((item, index) => {
          return (
            <View
              key={`imgSlider_${index}`}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={pressList[index]}
                activeOpacity={0.8}
                style={{
                  width: imageBoxWidth, //! 체험방 커스텀
                  height: imageBoxHeight,
                  borderRadius: scale(10),
                  borderWidth: scale(3),
                  borderColor: '#c01920',
                  overflow: 'hidden',
                  ...imageBoxCustomStyle,
                }}>
                <FastImage
                  source={{uri: item.image_full_file_path}}
                  style={{flex: 1}}
                  resizeMode={FastImage.resizeMode.stretch}
                />
              </TouchableOpacity>
              {hasYoutubeBtn && (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={pressList[index]}
                  style={{
                    width: scale(50),
                    height: scale(35),
                    position: 'absolute',
                  }}>
                  <FastImage
                    source={require('../../../assets/images/drawable-xxxhdpi/youtubeBtn.png')}
                    style={{
                      width: scale(50),
                      height: scale(35),
                    }}
                  />
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
      <View style={{...styles.viewBadge, ...indicatorCustomStyle}}>
        {images.map((item, index) => (
          <Badge
            key={`imgSliderPage_${index}`}
            badgeStyle={{
              backgroundColor: pageIndex === index ? activeBadgeColor : '#cccccc',
              width: pageIndex === index ? activeIndicatorWidth : indicatorWidth,
              ...eachIndicatorCustomStyle,
            }}
            containerStyle={{marginHorizontal: scale(2)}}
          />
        ))}
      </View>
    </View>
  );
};

export default ImageSlider;

ImageSlider.propTypes = {
  imageBoxHeight: PropTypes.number,
  imageBoxWidth: PropTypes.number,
  indicatorWidth: PropTypes.number,
  activeIndicatorWidth: PropTypes.number,
  activeBadgeColor: PropTypes.string,
  images: PropTypes.array.isRequired,
  autoSlide: PropTypes.bool,
  slideInterval: PropTypes.number,
};

ImageSlider.defaultProps = {
  imageBoxHeight: 200,
  imageBoxWidth: screenWidth,
  indicatorWidth: 6,
  activeIndicatorWidth: 6,
  activeBadgeColor: '#c01920',
  autoSlide: false,
  slideInterval: 3000,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: scale(10),
  },
});
