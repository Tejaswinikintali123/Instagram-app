import { GET_ERRORS,SET_CURRENT_USER } from "./types";

import axios from "axios";
import setAuthToken from '../utils/setAuthToken';
import jwt_decode from 'jwt-decode';
//Register user
export const registerUser = (userData,history)=>dispatch=> {
    axios
      .post("/api/users/register", userData)
      .then(res => history.push('/login'))
        .catch(err =>
            dispatch({
                 type: GET_ERRORS,
                payload: err.response.data
            })
        );
  
};
//Login-Get user token
export const loginUser = userData => dispatch => {
    axios.post('api/users/login', userData)
        .then(res => {
            //save to localstorage
            const { token } = res.data;
            //set token to ls
            localStorage.setItem('jwtToken', token);
            //set token to auth header
            setAuthToken(token);
            //Decode token to get user data
            const decoded = jwt_decode(token);
            //set redux store
            dispatch(setCurrentUser(decoded));
            
        })
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            }));
};
export const setCurrentUser = (decoded) => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded
    }
};
export const logoutUser = () => dispatch=>{
    //Remove token from ls
    localStorage.removeItem('jwtToken');

    //remove auth header
    setAuthToken(false);
    //set current user to {} in redux
    dispatch(setCurrentUser({}))
}
