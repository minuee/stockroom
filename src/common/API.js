const {Api} = require('@psyrenpark/api');

const projectName = 'er'; // 각 프로젝트 단축명
const projectEnv = 'prod'; // 각 프로젝트 환경 // dev, test, prod

const v1Api = `${projectName}-${projectEnv}-api-v1`;
const v1Cdn = `${projectName}-${projectEnv}-cdn-v1`;
const v1NoneAuth = `${projectName}-${projectEnv}-noneauth-v1`;
const v1Cms = `${projectName}-${projectEnv}-cms-v1`;

exports.apiObject = {
  //!----------------------------------------------------------
  //!  API

  // [API] 서비스 이용 문의 전송
  postMyInquire: ({inquiry_title, inquiry_content}, LoadingCallback) => {
    var apiName = v1Api;
    var path = '/inquirys';
    var myInit = {
      body: {
        // inquiry_type_code_id: 'INIT',
        inquiry_title,
        inquiry_content,
      },
    };
    return Api.post(apiName, path, myInit, LoadingCallback);
  },

  // [API] 유저 정보 가져오기
  getUserInfo: LoadingCallback => {
    var apiName = v1Api;
    var path = '/users/my-info';
    var myInit = {};
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  // [API] 유저 정보 수정하기
  editUserInfo: ({user_nick_name, user_phone_no, user_profile_image_no, user_push_key}, LoadingCallback) => {
    var apiName = v1Api;
    var path = '/users/my-info';
    var myInit = {
      body: {
        user_nick_name,
        user_phone_no,
        user_profile_image_no,
        user_push_key,
      },
    };
    return Api.put(apiName, path, myInit, LoadingCallback);
  },

  // [API] 유저 타입 정보 가져오기
  getUserTypeInfo: ({user_no}, LoadingCallback) => {
    var apiName = v1Api;
    var path = `/user-details/${user_no}`;
    var myInit = {};
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  // [API] 유저 타입 정보 수정하기
  editUserTypeInfo: (
    {user_inverst_type_code_id, user_prediction_money, user_stock_company_code_id, is_consult},
    LoadingCallback
  ) => {
    var apiName = v1Api;
    var path = '/user-details/my-detail';
    var myInit = {
      body: {
        user_inverst_type_code_id,
        user_prediction_money,
        user_stock_company_code_id,
        is_consult,
      },
    };
    return Api.put(apiName, path, myInit, LoadingCallback);
  },

  // [API] 이미지 번호 추가
  createImage: ({image_type_code_id, image_file_path}, LoadingCallback) => {
    var apiName = v1NoneAuth;
    var path = '/images';
    var myInit = {
      body: {
        image_type_code_id,
        image_file_path,
      },
    };
    return Api.post(apiName, path, myInit, LoadingCallback);
  },

  // [API] 채팅 무시 유저 리스트
  listIgnoreToUserList: LoadingCallback => {
    var apiName = v1Api;
    var path = '/ignore-users';
    var myInit = {};
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  // [API] 채팅 무시 설정
  setIgnoreToUser: ({ignore_user_no, flag}, LoadingCallback) => {
    var apiName = v1Api;
    var path = `/ignore-users/${ignore_user_no}`;

    if (flag) {
      var myInit = {};
      return Api.put(apiName, path, myInit, LoadingCallback);
    } else {
      var myInit = {};
      return Api.del(apiName, path, myInit, LoadingCallback);
    }
  },

  // [API] 채팅 참가 설정
  updateChatConnection: ({chat_room_no}, LoadingCallback) => {
    var apiName = v1Api;
    var path = '/chat-connection-historys/my-connection';

    var myInit = {
      queryStringParameters: {chat_room_no},
    };
    return Api.put(apiName, path, myInit, LoadingCallback);
  },

  // [API] 채팅 나가기 설정
  quitChatConnection: ({chat_room_no}, LoadingCallback) => {
    var apiName = v1Api;
    var path = '/chat-connection-historys/my-connection';

    var myInit = {
      queryStringParameters: {chat_room_no},
    };
    return Api.del(apiName, path, myInit, LoadingCallback);
  },

  // [API] 추천 종목 가져오기
  getRecommandStockList: ({chat_room_no}, LoadingCallback) => {
    var apiName = v1Api;
    var path = '/stock-recommends';

    var myInit = {
      queryStringParameters: {chat_room_no, limit: 5},
    };
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  // [API] 메인, 채팅 INIT
  getChatInitData: ({chat_room_no}, LoadingCallback) => {
    var apiName = v1Api;
    var path = '/chat-messages/init';

    var myInit = {
      queryStringParameters: {chat_room_no},
    };
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  // [API] 과거 주식 정보 불러오기
  getStockHistoryData: ({stock_code_no, cycle_type_code}, LoadingCallback) => {
    var apiName = v1Api;
    var path = '/stock-historys';

    var myInit = {
      queryStringParameters: {stock_code_no, cycle_type_code},
    };
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  // [API] 메뉴 화면 배너 정보 가져오기
  getMenuMainBannerInfo: LoadingCallback => {
    var apiName = v1Api;
    var path = '/user-profits/my-frofit';

    var myInit = {};
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  //!----------------------------------------------------------
  //!  CDN

  /**
   * [CDN] 코드타입 종류 가져오기
   * @param {Function} LoadingCallback          - 로딩 콜백
   */
  getCodeType: ({locale}, LoadingCallback) => {
    var apiName = v1Cdn;
    var path = '/code-types';
    var myInit = {};
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  /**
   * [CDN]  해당 코드 타입 가져오기
   * @param {string} code_type_id               - 참고 https://9ay5u7wxb5.execute-api.ap-northeast-2.amazonaws.com/prod/cdn/v1/cdn/codeType?1=1
   * @param {Function} LoadingCallback          - 로딩 콜백
   */
  getCode: ({code_type_id}, LoadingCallback) => {
    var apiName = v1Cdn;
    var path = `/codes/${code_type_id}`;
    var myInit = {};
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  // [CDN] 공지사항 가져오기
  getNoticeList: ({orderBy, next_token, limit, filter}, LoadingCallback) => {
    var apiName = v1Cdn;
    var path = '/notices';
    var myInit = {
      queryStringParameters: {
        orderBy: JSON.stringify({create_at: 'DESC'}),
        next_token,
        limit,
        filter,
      },
    };
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  // [CDN] 푸시 알림 가져오기
  getNotificationList: ({orderBy, next_token, limit, filter}, LoadingCallback) => {
    var apiName = v1Cdn;
    var path = '/pushs';
    var myInit = {
      queryStringParameters: {
        orderBy: JSON.stringify({push_no: 'DESC'}),
        next_token,
        limit,
        filter,
      },
    };
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  // [CDN] 약관 가져오기
  getPPnTOS: ({content_type_code_id}, LoadingCallback) => {
    var apiName = v1Cdn;
    var path = '/contents';
    var myInit = {
      queryStringParameters: {
        content_type_code_id,
      },
    };
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  // [CDN] 배너 가져오기
  getBannerList: LoadingCallback => {
    var apiName = v1Cdn;
    var path = '/banners';
    var myInit = {
      queryStringParameters: {
        orderBy: JSON.stringify({banner_order_weight: 'DESC'}),
        limit: 5,
        filter: JSON.stringify({and: [{is_active: {eq: true}}]}),
      },
    };
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  //!----------------------------------------------------------
  //!  NONEAUTH

  /**
   * [NONEAUTH]  인증 문자 보내기
   * @param {string} user_phone_no
   * @param {Function} LoadingCallback          - 로딩 콜백
   */
  postPreConfirmation: ({user_phone_no}, LoadingCallback) => {
    var apiName = v1NoneAuth;
    var path = '/pre-confirmations';
    var myInit = {
      body: {
        user_phone_no,
      },
    };
    return Api.post(apiName, path, myInit, LoadingCallback);
  },

  /**
   * [NONEAUTH]  인증 코드 확인하기
   * @param {string} user_phone_no
   * @param {string} user_confirm_code
   * @param {int} pre_confirmation_no
   * @param {Function} LoadingCallback          - 로딩 콜백
   */
  putPreConfirmation: ({user_phone_no, user_confirm_code, pre_confirmation_no}, LoadingCallback) => {
    var apiName = v1NoneAuth;
    var path = `/pre-confirmations/${pre_confirmation_no}`;
    var myInit = {
      body: {
        user_phone_no,
        user_confirm_code,
      },
    };
    return Api.put(apiName, path, myInit, LoadingCallback);
  },

  /**
   * [NONEAUTH]  이메일 있는지 여부 체크
   * @param {string} user_email
   * @param {Function} LoadingCallback          - 로딩 콜백
   */
  checkToEmail: ({user_email}, LoadingCallback) => {
    var apiName = v1NoneAuth;
    var path = '/pre-confirmations/check/email';
    var myInit = {
      queryStringParameters: {user_email},
    };
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  // [NONEAUTH] 공지사항 조회수 증가
  updateNoticeViewCount: ({no}, LoadingCallback) => {
    var apiName = v1NoneAuth;
    var path = `/notices/${no}`;
    var myInit = {};
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  // [NONEAUTH] 푸시 알림 조회수 증가
  updateNotifyViewCount: ({no}, LoadingCallback) => {
    var apiName = v1NoneAuth;
    var path = `/pushs/${no}`;
    var myInit = {};
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  // [NONEAUTH] 배너 조회수 증가
  updateBannerViewCount: ({no}, LoadingCallback) => {
    var apiName = v1NoneAuth;
    var path = `/banners/${no}`;
    var myInit = {};
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  // [NONEAUTH] 수익 인증 가져오기
  getProfitsList: ({page, next_token, orderBy}, LoadingCallback) => {
    var apiName = v1NoneAuth;
    var path = '/profit-certifications';

    var myInit = {
      queryStringParameters: {page, next_token, orderBy, limit: 10},
    };
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  // [NONEAUTH] 수익 인증 상세 가져오기
  getProfitDetail: ({no}, LoadingCallback) => {
    var apiName = v1NoneAuth;
    var path = `/profit-certifications/${no}`;

    var myInit = {};
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  // RHC TV 영상목록 가져오기
  getRhcTvList: ({orderBy, next_token, page, filter}, LoadingCallback) => {
    var apiName = v1NoneAuth;
    var path = '/rhc-tvs';

    var myInit = {
      queryStringParameters: {orderBy, next_token, page, limit: 10, filter},
    };
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  // RHC TV 각 항목 조회수 증가
  updateRhcViewCount: ({no}, LoadingCallback) => {
    var apiName = v1NoneAuth;
    var path = `/rhc-tvs/${no}`;
    var myInit = {};
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  // 자료실 관련 데이터 가져오기
  getReferenceList: ({orderBy, next_token, page, filter}, LoadingCallback) => {
    var apiName = v1NoneAuth;
    var path = '/reference-rooms';

    var myInit = {
      queryStringParameters: {orderBy, next_token, page, limit: 10, filter},
    };
    return Api.get(apiName, path, myInit, LoadingCallback);
  },

  // 자료실 데이터 각 항목 조회수 증가
  updateReferenceViewCount: ({no}, LoadingCallback) => {
    var apiName = v1NoneAuth;
    var path = `/reference-rooms/${no}`;
    var myInit = {};
    return Api.get(apiName, path, myInit, LoadingCallback);
  },
};
