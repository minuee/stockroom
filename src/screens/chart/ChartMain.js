import React, {useState, useEffect, useRef} from 'react';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  processColor,
  TouchableOpacity,
  UIManager,
  LayoutAnimation,
} from 'react-native';

import scale from '../../common/Scale';
import {apiObject} from '../../common/API';
import {addComma, isIOS, changeTime, isEmpty} from '../../common/Utils';

import useLoading from '../../Hooks/useLoading';

import LoadingIndicator from '../../screens/common/LoadingIndicator';

import {Header} from 'react-native-elements';
import {BarChart, CombinedChart} from 'react-native-charts-wrapper';
import dayjs from 'dayjs';
import objectSupport from 'dayjs/plugin/objectSupport';

import Toast from 'react-native-simple-toast';

import {API, graphqlOperation} from 'aws-amplify';

import * as subscriptions from '../../common/graphql/subscriptions';

if (!isIOS() && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

dayjs.extend(objectSupport);

const era = dayjs('1970-01-01', 'YYYY-MM-DD');
const distanceToLoadMore = 10;
const pageSize = 60;

let subscribeRef = null;

const STOCK_INFO = {
  create_at: new Date(),
  update_at: new Date(),
  market_type: '',
  stock_code: '',
  stock_code_no: '',
  stock_name: '',
  stock_recommend_no: '',
  stock_composite_rating: 0, // 종함점수 없어질수 있음
  stock_percentage_change: 0, // 등락율
  trdPrc: 0, // 종가
  cmpprevddPrc: 0, // 전일차
};

const ChartMain = props => {
  const {isLoading, setIsLoading} = useLoading();

  const refCombinedChart = useRef(null);
  const refBarChart = useRef(null);

  const stock_code_no = props.route.params?.stock_code_no;
  const [stockInfo, setStockInfo] = useState(STOCK_INFO);

  const [xMin, setXMin] = useState(0);
  const [xMax, setXMax] = useState(0);
  const [chartDesign, setChartDesign] = useState({
    priceXAxis: {
      drawLabels: false,
      granularity: 1,
      granularityEnabled: true,
      valueFormatter: 'date',
      valueFormatterPattern: 'MM-dd',
      since: 0,
      timeUnit: 'DAYS',
    },
    volumeXAxis: {
      drawLabels: true,
      position: 'BOTTOM',
      granularity: 1,
      granularityEnabled: true,
      valueFormatter: 'date',
      valueFormatterPattern: 'MM-dd',
      since: 0,
      timeUnit: 'DAYS',
    },
    visibleRange: {x: {min: 1, max: 30}},
  });

  const [standardTime, setStandardTime] = useState(new Date());

  const [chartSearchParam, setChartSearchParam] = useState('D'); // "M" , "W" , "D" , "m"
  const [isChartInfoVisible, setIsChartInfoVisible] = useState(true);

  const getIndexOfDay = day => {
    return dayjs(day, 'YYYY-MM-DD').diff(era, 'days');
  };

  const getIndexOfMinute = day => {
    return dayjs(day).diff(dayjs().startOf('days'), 'minutes');
  };

  // 실시간 주식 정보
  const generateRealTimeData = data => {
    let priceData = [];
    let ma5Data = [];
    let ma15Data = [];
    let volumeData = [];

    const date =
      chartSearchParam === 'D'
        ? dayjs(String(data[0].trdDd)).format('YYYY-MM-DD')
        : dayjs(
            String(data[0].inddTm).length === 7
              ? {hour: String(data[0].inddTm).slice(0, 1), minute: String(data[0].inddTm).slice(1, 3)}
              : {hour: String(data[0].inddTm).slice(0, 2), minute: String(data[0].inddTm).slice(2, 4)}
          );
    const dateIndex = chartSearchParam === 'D' ? getIndexOfDay(date) : getIndexOfMinute(date);

    // 캔들차트
    priceData.push({
      x: dateIndex,
      shadowH: data[0].hgprc,
      shadowL: data[0].lwprc,
      open: data[0].opnprc,
      close: data[0].trdPrc,
      date,
    });

    // // 5일 평균 가격
    // ma5Data.push({
    //   x: dateIndex,
    //   y: Number(data[0].ma5),
    // });

    // // 15일 평균가격
    // ma15Data.push({
    //   x: dateIndex,
    //   y: Number(data[0].ma15),
    // });

    // 거래량 (체결 주 단위)
    volumeData.push({
      x: dateIndex,
      y: data[0].accTrdvol,
    });

    return {
      combinedData: {
        // lineData: {
        //   dataSets: [
        //     {
        //       values: [...chartDesign.combinedData.lineData.dataSets[0].values, ...ma5Data],
        //       label: 'MA5',
        //       config: {
        //         drawValues: false,
        //         mode: 'HORIZONTAL_BEZIER',
        //         drawCircles: false,
        //         color: processColor('red'),
        //       },
        //     },
        //     {
        //       values: [...chartDesign.combinedData.lineData.dataSets[1].values, ...ma15Data],
        //       label: 'MA15',
        //       config: {
        //         drawValues: false,
        //         mode: 'HORIZONTAL_BEZIER',
        //         drawCircles: false,
        //         color: processColor('#cf62e1'),
        //       },
        //     },
        //   ],
        // },
        lineData: {...chartDesign.combinedData.lineData},
        candleData: {
          dataSets: [
            {
              values: [...chartDesign.combinedData.candleData.dataSets[0].values, ...priceData],
              label: '가격',
              config: {
                drawValues: false,
                highlightColor: processColor('darkgray'),
                shadowWidth: 1,
                shadowColorSameAsCandle: true,
                increasingColor: processColor('#ec2f37'),
                increasingPaintStyle: 'FILL',
                decreasingColor: processColor('#1e79ef'),
              },
            },
          ],
        },
      },
      volumeData: {
        dataSets: [
          {
            values: [...chartDesign.volumeData.dataSets[0].values, ...volumeData],
            label: '거래량(주)',
            config: {
              drawValues: false,
              color: processColor('pink'),
            },
          },
        ],
      },
    };
  };

  // API 주식 정보
  const generateNewData = data => {
    let priceData = [];
    let ma5Data = [];
    let ma15Data = [];
    let volumeData = [];

    for (let i = 0; i < data.length; i++) {
      const date =
        chartSearchParam === 'D'
          ? dayjs(String(data[i].trdDd)).format('YYYY-MM-DD')
          : dayjs(
              String(data[i].inddTm).length === 7
                ? {hour: String(data[i].inddTm).slice(0, 1), minute: String(data[i].inddTm).slice(1, 3)}
                : {hour: String(data[i].inddTm).slice(0, 2), minute: String(data[i].inddTm).slice(2, 4)}
            );

      // 캔들차트
      priceData.push({
        x: chartSearchParam === 'D' ? getIndexOfDay(date) : getIndexOfMinute(date),
        shadowH: data[i].hgprc,
        shadowL: data[i].lwprc,
        open: data[i].opnprc,
        close: data[i].trdPrc,
        date,
      });

      // 5일 평균 가격
      !isEmpty(data[i].ma5) &&
        ma5Data.push({
          x: getIndexOfDay(date),
          y: Number(data[i].ma5),
        });

      // 15일 평균가격
      !isEmpty(data[i].ma15) &&
        ma15Data.push({
          x: getIndexOfDay(date),
          y: Number(data[i].ma15),
        });

      // 거래량 (체결 주 단위)
      volumeData.push({
        x: chartSearchParam === 'D' ? getIndexOfDay(date) : getIndexOfMinute(date),
        y: data[i].accTrdvol,
      });
    }

    return {
      combinedData: {
        lineData: {
          dataSets: [
            {
              values: ma5Data,
              label: 'MA5',
              config: {
                drawValues: false,
                mode: 'HORIZONTAL_BEZIER',
                drawCircles: false,
                color: processColor('red'),
              },
            },
            {
              values: ma15Data,
              label: 'MA15',
              config: {
                drawValues: false,
                mode: 'HORIZONTAL_BEZIER',
                drawCircles: false,
                color: processColor('#cf62e1'),
              },
            },
          ],
        },
        candleData: {
          dataSets: [
            {
              values: priceData,
              label: '가격',
              config: {
                drawValues: false,
                highlightColor: processColor('darkgray'),
                shadowWidth: 1,
                shadowColorSameAsCandle: true,
                increasingColor: processColor('#ec2f37'),
                increasingPaintStyle: 'FILL',
                decreasingColor: processColor('#1e79ef'),
              },
            },
          ],
        },
      },
      volumeData: {
        dataSets: [
          {
            values: volumeData,
            label: '거래량(주)',
            config: {
              drawValues: false,
              color: processColor('pink'),
            },
          },
        ],
      },
    };
  };

  // 주식 정보 가져오기
  const _getStockHistoryData = async () => {
    try {
      const apiResult = await apiObject.getStockHistoryData(
        {stock_code_no, cycle_type_code: chartSearchParam},
        setIsLoading
      );

      setStockInfo(apiResult.info);

      if (apiResult.items.length === 0) {
        return null;
      }
      apiResult.items.reverse();
      let today =
        chartSearchParam === 'D'
          ? dayjs(apiResult.items[apiResult.items.length - 1].trdDd.toString()).format('YYYY-MM-DD')
          : dayjs(
              String(apiResult.items[apiResult.items.length - 1].inddTm).length === 7
                ? {
                    hour: String(apiResult.items[apiResult.items.length - 1].inddTm).slice(0, 1),
                    minute: String(apiResult.items[apiResult.items.length - 1].inddTm).slice(1, 3),
                  }
                : {
                    hour: String(apiResult.items[apiResult.items.length - 1].inddTm).slice(0, 2),
                    minute: String(apiResult.items[apiResult.items.length - 1].inddTm).slice(2, 4),
                  }
            );
      let start =
        chartSearchParam === 'D'
          ? dayjs(apiResult.items[0].trdDd.toString()).format('YYYY-MM-DD')
          : dayjs(
              String(apiResult.items[0].inddTm).length === 7
                ? {
                    hour: String(apiResult.items[0].inddTm).slice(0, 1),
                    minute: String(apiResult.items[0].inddTm).slice(1, 3),
                  }
                : {
                    hour: String(apiResult.items[0].inddTm).slice(0, 2),
                    minute: String(apiResult.items[0].inddTm).slice(2, 4),
                  }
            );

      let axisMinimum = chartSearchParam === 'D' ? getIndexOfDay(start) - 2 : getIndexOfMinute(start) - 2;
      let axisMaximum = chartSearchParam === 'D' ? getIndexOfDay(today) + 2 : getIndexOfMinute(today) + 2;

      setChartDesign({
        ...chartDesign,
        ...generateNewData(apiResult.items),
        zoom: {
          scaleX: 1,
          scaleY: 1,
          xValue: chartSearchParam === 'D' ? getIndexOfDay(today) - 5 : getIndexOfMinute(today) - 5,
          yValue: 0,
          axisDependency: 'RIGHT',
        },
        priceXAxis: {
          ...chartDesign.priceXAxis,
          axisMinimum: axisMinimum,
          axisMaximum: axisMaximum,
        },
        volumeXAxis: {
          ...chartDesign.volumeXAxis,
          axisMinimum: axisMinimum,
          axisMaximum: axisMaximum,
          drawLabels: chartSearchParam === 'D' ? true : false,
        },
      });
    } catch (error) {
      console.log('🚀 ~ const_getStockHistoryData= ~ error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  // 실시간 주식 캔들
  const _setChartInfoData = async data => {
    const stock_history_content = JSON.parse(data.stock_history_content);
    const content = JSON.parse(stock_history_content);

    setStandardTime(data.create_at);
    setStockInfo(content.info);

    const realTimeData = generateRealTimeData(content.items);

    refCombinedChart.current.setDataAndLockIndex(realTimeData.combinedData);
    refBarChart.current.setDataAndLockIndex(realTimeData.volumeData);

    // const axisMaximum =
    //   Number(realTimeData.volumeData.dataSets[0].values[realTimeData.volumeData.dataSets[0].values.length - 1].x) + 1;

    // setChartDesign({
    //   ...chartDesign,
    //   priceXAxis: {...chartDesign.priceXAxis, axisMaximum},
    //   volumeXAxis: {...chartDesign.volumeXAxis, axisMaximum},
    // });

    // refCombinedChart.current.moveViewToX(axisMaximum);
    // refBarChart.current.moveViewToX(axisMaximum);
  };

  // 실시간 차트 접속
  const _appSyncInit = () => {
    console.log('chart useEffect init');

    if (subscribeRef) {
      return null;
    }

    subscribeRef = API.graphql(
      graphqlOperation(subscriptions.onCreateStockHistory, {
        stock_code_no,
      })
    ).subscribe({
      next: data => _setChartInfoData(data.value.data.data),
    });
  };

  // 실시간 차트 접속 해제
  const _appSyncRelease = () => {
    if (subscribeRef) {
      console.log('chart useEffect release');
      subscribeRef.unsubscribe();
      subscribeRef = null;
    }
  };

  useEffect(() => {
    _getStockHistoryData();
  }, [chartSearchParam]);

  useEffect(() => {
    if (!isEmpty(chartDesign.combinedData)) {
      _appSyncInit();
    }

    return () => {
      _appSyncRelease();
    };
  }, [chartDesign]);

  return (
    <View style={{...styles.container(isChartInfoVisible)}}>
      {isLoading && <LoadingIndicator />}

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
        centerComponent={{
          text: stockInfo.stock_name,
          style: {fontSize: scale(21), fontWeight: 'bold'},
        }}
        centerContainerStyle={{justifyContent: 'center'}}
        placement="left"
        containerStyle={{borderBottomWidth: 0}}
        rightComponent={
          !isChartInfoVisible && (
            <View>
              <Text style={{fontSize: scale(18), color: '#ec2f37'}}>{stockInfo.trdPrc}</Text>
              <Text style={{fontSize: scale(13), color: '#ec2f37'}}>
                {`${stockInfo.cmpprevddPrc} (${stockInfo.stock_percentage_change}%) `}
              </Text>
            </View>
          )
        }
        rightContainerStyle={{justifyContent: 'center'}}
      />
      <SafeAreaView style={{...styles.content}}>
        {isChartInfoVisible && (
          <View style={{...styles.viewStockInfoBox}}>
            <Text
              style={{
                fontSize: scale(13),
                color: '#999999',
              }}>{`${stockInfo.stock_code} | ${stockInfo.market_type}`}</Text>
            <Text style={{fontSize: scale(38), fontWeight: 'bold', color: '#ec2f37'}}>
              {addComma(Number(stockInfo.trdPrc))}
            </Text>
            <Text style={{fontSize: scale(13), color: Number(stockInfo.cmpprevddPrc) > 0 ? '#ec2f37' : '#1e79ef'}}>
              {`${addComma(Number(stockInfo.cmpprevddPrc))} (${stockInfo.stock_percentage_change}%) `}
              <Text style={{fontSize: scale(11), color: '#999999'}}>{`${changeTime(
                +new Date(standardTime) / 1000
              )} 기준`}</Text>
            </Text>
          </View>
        )}
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <View style={{...styles.viewSelectParamBox}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                style={{...styles.viewSelectParamButton, backgroundColor: chartSearchParam === 'D' ? 'black' : 'white'}}
                onPress={() => setChartSearchParam('D')}>
                <Text
                  style={{
                    color: chartSearchParam === 'D' ? 'white' : '#999999',
                    fontWeight: chartSearchParam === 'D' ? 'bold' : 'normal',
                  }}>
                  일
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{...styles.viewSelectParamButton, backgroundColor: chartSearchParam === 'm' ? 'black' : 'white'}}
                onPress={() => setChartSearchParam('m')}>
                <Text
                  style={{
                    color: chartSearchParam === 'm' ? 'white' : '#999999',
                    fontWeight: chartSearchParam === 'm' ? 'bold' : 'normal',
                  }}>
                  분
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{...styles.viewChartToggle}}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setIsChartInfoVisible(!isChartInfoVisible);
              }}>
              <Text style={{color: '#999999'}}>{isChartInfoVisible ? '크게보기⬆︎' : '작게보기⬇︎'}</Text>
            </TouchableOpacity>
          </View>
          <CombinedChart
            ref={refCombinedChart}
            data={chartDesign.combinedData}
            xAxis={chartDesign.priceXAxis}
            visibleRange={chartDesign.visibleRange}
            zoom={chartDesign.zoom}
            group="stock"
            identifier="price"
            syncX={true}
            syncY={false}
            dragDecelerationEnabled={false}
            yAxis={{left: {enabled: false}}}
            doubleTapToZoomEnabled={false}
            chartDescription={{text: ''}}
            legend={{verticalAlignment: 'TOP'}}
            style={{flex: 4}}
          />

          <BarChart
            ref={refBarChart}
            data={chartDesign.volumeData}
            xAxis={chartDesign.volumeXAxis}
            visibleRange={chartDesign.visibleRange}
            zoom={chartDesign.zoom}
            group="stock"
            identifier="volume"
            syncX={true}
            syncY={false}
            dragDecelerationEnabled={false}
            yAxis={{left: {enabled: false}}}
            doubleTapToZoomEnabled={false}
            chartDescription={{text: ''}}
            legend={{verticalAlignment: 'TOP'}}
            style={{flex: 1}}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default ChartMain;

const styles = StyleSheet.create({
  container: color => ({
    flex: 1,
    backgroundColor: color ? '#f5f5f5' : 'white',
  }),
  content: {
    flex: 1,
  },
  viewStockInfoBox: {
    backgroundColor: 'white',
    borderRadius: scale(5),
    marginHorizontal: scale(20),
    ...Platform.select({
      ios: {
        shadowColor: '#ddd',
        shadowOffset: {
          // width: scale(2),
          // height: scale(2),
        },
        shadowRadius: scale(5),
        shadowOpacity: 1,
      },
      android: {
        elevation: scale(3),
      },
    }),
    paddingVertical: scale(15),
    paddingHorizontal: scale(20),
    marginBottom: scale(20),
  },
  viewSelectParamBox: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewSelectParamButton: {
    borderRadius: scale(11.5),
    paddingHorizontal: scale(13),
    paddingVertical: scale(5),
  },
  viewChartToggle: {
    borderRadius: scale(11.5),
    paddingHorizontal: scale(13),
    paddingVertical: scale(5),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#dddddd',
  },
});
