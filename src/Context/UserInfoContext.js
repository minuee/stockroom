import {createContext} from 'react';

const UserInfoContext = createContext({
  isSessionAlive: false,
  userNo: '',
  userUUID: '',
  userEmail: '',
  userImage: '',
  userName: '',
  userNickName: '',
  userPhone: '',
  userType: '',
  isPaid: false,
  isExit: false,
  isBlock: false,
  blockList: [],
  setIsSessionAlive: () => {},
  setUserInfo: () => {},
  resetUserInfo: () => {},
});

export default UserInfoContext;
