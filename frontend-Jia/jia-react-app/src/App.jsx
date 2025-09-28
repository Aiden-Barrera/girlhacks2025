import Title from "./Components-Jia/HomeScreen/Title.jsx";
import AboutUs from "./Components-Jia/HomeScreen/AboutUs.jsx"
import GetStarted from "./Components-Jia/HomeScreen/GetStarted.jsx";
import NewUser from "./Components-Jia/HomeScreen/NewUser.jsx";
import ReturningUser from "./Components-Jia/HomeScreen/ReturningUser.jsx";
import TestBox from "./Components-Jia/HomeScreen/TestBox.jsx";
import SignUpButton from "./Components-Jia/HomeScreen/SignUpButton.jsx";
import LogInButton from "./Components-Jia/HomeScreen/LogInButton.jsx";
//import NavBar from "./Components-Jia/NavBar.jsx";

import Node from "./Components-Jia/MainPage/Node.jsx";

import AccountButton from "./Components-Jia/AccountButton.jsx";
import './App.css'

// 'App' component, that will serve as the root
function App() {
  
  //NavBar is not working :((
  // The components on top are all for the HomePage.  While the components from Node down are for the MainPage
  return(
    <>
    <Title/>
    <AboutUs/>
    <GetStarted/>
    <NewUser/>
    <SignUpButton/>
    <ReturningUser/>
    <LogInButton/>

    <Node/>
    <AccountButton/>

    </>
  );
}

export default App