import React from 'react';
import { StyleSheet, Text, View,Image } from 'react-native';
import TransactionScreen from './screens/bookTransaction';
import SearchScreen from './screens/search';
import {createAppContainer,createSwitchNavigator} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs'
import LoginScreen from './screens/loginScreen';
export default class App extends React.Component{
   
    render(){
        console.log("App.js Started");
        return(
            <AppContainer/>
        );
    }
}
const TabNavigator=createBottomTabNavigator({
          Transaction:{screen:TransactionScreen},
          Search:{screen:SearchScreen}
          
},
    {
        // bracket represent the html and the one bracket represents the javaScript
        defaultNavigationOptions:({navigation})=>({
            tabBarIcon:()=>{
                const routeName=navigation.state.routeName
                if(routeName==="Transaction"){
                    return(
                        <Image style={{width:40,height:40,}} source={require("./assets/transaction.png")  }></Image>
                    )
                }
                else if (routeName==="Search"){
                    return(
                        <Image style={{width:40,height:40,}} source={require("./assets/search.png")  }></Image>
                    )
                }
            }
        })
    }
)
const SwitchNavigator=createSwitchNavigator({
    LoginScreen:{screen:LoginScreen},
    TabNavigator:{screen:TabNavigator}
})
const AppContainer=createAppContainer(SwitchNavigator);

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
  