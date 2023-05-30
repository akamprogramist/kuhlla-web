import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { useSelector } from "react-redux";
import Loader from "../../components/loader/Loader";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const FirebaseData = () => {
  const setting = useSelector((state) => state.setting);

  if (setting.setting === null) {
    return <Loader screen="full" />;
  }

  const apiKey = setting.setting && setting.setting.firebase.apiKey;
  const authDomain = setting.setting && setting.setting.firebase.authDomain;
  const projectId = setting.setting && setting.setting.firebase.projectId;
  const storageBucket =
    setting.setting && setting.setting.firebase.storageBucket;
  const messagingSenderId =
    setting.setting && setting.setting.firebase.messagingSenderId;
  const appId = setting.setting && setting.setting.firebase.appId;
  const measurementId =
    setting.setting && setting.setting.firebase.measurementId;

  const firebaseConfig = {
    apiKey: "AIzaSyA2G042qHT7T1aWKE-5LAN5rKFYk8-P8ts",
    authDomain: "kuhhlal.firebaseapp.com",
    projectId: "kuhhlal",
    storageBucket: "kuhhlal.appspot.com",
    messagingSenderId: "429303454133",
    appId: "1:429303454133:web:9c5127c89ff880e8a961fc",
    measurementId: "G-BYWR98NG47",
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else {
    firebase.app();
  }

  const auth = firebase.auth();
  const messaging = getMessaging(firebase.app());

  return { auth, firebase, messaging };
};

export default FirebaseData;
export const fcmToken = (setTokenFound) => {
  const { messaging } = FirebaseData();
  // return getToken(messaging, {vapidKey: 'BEi3E10PuFA0QiE3VyZcGCIWSJVxAT3iYHDqq9U8RPF3d43sZZkRnuTzJAZFk3UZDa2zDcrwMEV41cRjtVs8lLc'}).then((currentToken) => {
  //   if (currentToken) {
  //     console.log(currentToken)
  //     setTokenFound(true);
  //     // Track the token -> client mapping, by sending to backend server
  //     // show on the UI that permission is secured
  //   } else {
  //     console.log('No registration token available. Request permission to generate one.');
  //     setTokenFound(false);

  //   }
  // }).catch((err) => {
  //   console.log('An error occurred while retrieving token. ', err);
  //   // catch error while creating client token
  // });
  return "hi";
};
export const onMessageListener = () => {
  // new Promise((resolve) => {
  //   const {messaging} = FirebaseData()
  //   onMessage(messaging, (payload) => {
  //     resolve(payload);
  //   });
  // });
};
