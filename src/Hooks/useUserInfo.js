import React, {useContext} from 'react';
import UserInfoContext from '../Context/UserInfoContext';

const useUserInfo = () => {
  const userInfo = useContext(UserInfoContext);

  return userInfo;
};
export default useUserInfo;
