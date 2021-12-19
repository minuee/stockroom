import React, {useState} from 'react';
import UserTokenContext from '../Context/UserInfoContext';

// import * as Keychain from 'react-native-keychain';

const UserInfoProvider = ({children}) => {
  const setIsSessionAlive = bool => {
    setUser(prevState => {
      return {
        ...prevState,
        isSessionAlive: bool,
      };
    });
  };

  const setUserInfo = data => {
    setUser(prevState => {
      return {
        ...prevState,
        ...data,
      };
    });
  };

  const resetUserInfo = async () => {
    setUser(initialState);
  };

  const initialState = {
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
    setIsSessionAlive,
    setUserInfo,
    resetUserInfo,
  };

  const [user, setUser] = useState(initialState);

  return <UserTokenContext.Provider value={user}>{children}</UserTokenContext.Provider>;
};

export default UserInfoProvider;
