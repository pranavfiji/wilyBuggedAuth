import React from 'react';
import { StyleSheet, Text, View,TextInput,TouchableOpacity} from 'react-native';
import firebase from "firebase"
import db from "../config"
import { FlatList, ScrollView } from 'react-native-gesture-handler';
export default class SearchScreen extends React.Component{
    constructor(props){
        super(props);
        this.state={
            allTransactions:[],
            lastVisibleTransaction:null,
            search:""
     };
    
    }
    // It is the staging process where you do not question but it just happens.
    //.limt(10) is 
    componentDidMount=async()=>{
        const query=await db.collection("transaction").limit(10).get();
        query.docs.map((doc)=>{
            this.setState({
                // spread operator is one allows each and every on one array. 
                //In this case the value is every transaction made
              allTransactions:[],
             lastVisibleTransaction:doc,
                
            })
        })
       
    }
    fetchMoreTransactions = async ()=>{
        var text = this.state.search.toUpperCase()
        var enteredText = text.split("")
  
        
        if (enteredText[0].toUpperCase() ==='B'){
        const query = await db.collection("transaction").where('bookID','==',text)
        .startAfter(this.state.lastVisibleTransaction).limit(10).get()
        query.docs.map((doc)=>{
          this.setState({
            allTransactions: [...this.state.allTransactions, doc.data()],
            lastVisibleTransaction: doc
          })
        })
      }
        else if(enteredText[0].toUpperCase() === 'S'){
          const query = await db.collection("transaction").where('bookID','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
          query.docs.map((doc)=>{
            this.setState({
              allTransactions: [...this.state.allTransactions, doc.data()],
              lastVisibleTransaction: doc
            })
          })
        }
    }

    searchTransactions=async(searchText)=>{
      // split is dividing.. It means 
      console.log(searchText)
        var enteredText=searchText.split('');
        console.log(enteredText);
        var text= searchText.toUpperCase();
        console.log(text);
        this.setState({
          allTransactions:[]
        });
        if (enteredText[0].toUpperCase() ==='B'){
            const transaction =  await db.collection("transaction").where('bookID','==',text).get()
            transaction.docs.map((doc)=>{
              this.setState({
                allTransactions:[...this.state.allTransactions,doc.data()],
                lastVisibleTransaction: doc
              })
            })
          }
          else if(enteredText[0].toUpperCase() === 'S'){
            const transaction = await db.collection('transaction').where('studentID','==',text).get()
            transaction.docs.map((doc)=>{
              this.setState({
                allTransactions:[...this.state.allTransactions,doc.data()],
                lastVisibleTransaction: doc
              })
            })
          }
    }
    render(){
        return(
            /*FlatList has 3 key props:
● data : This contains all the data
in the array which needs to be
rendered.
● renderItem : This takes each
item from the data array and
renders it as described using
JSX. This should return a JSX
component.
● keyExtractor : It gives a unique
key prop to each item in the
list. The unique key prop
should be a string.
FlatList has two more important
props.
onEndReached and
onEndThreshold
● onEndReached can call a
function to get more
transaction documents after
the last transaction document
we fetched.
● onEndThreshold defines
when we want to call the
function inside onEndReached
prop. If onEndThreshold is 1,
the function will be called when
the user has completely
scrolled through the list. If
onEndThreshold is 0.5, the
function will be called when the
user is mid-way during
scrolling the items.
*/
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <TextInput 
                style ={styles.bar}
                placeholder = "Enter Book Id or Student Id"
                onChangeText={(text)=>{this.setState({search:text})}}/>
                <TouchableOpacity
                style = {styles.searchButton}
                onPress={()=>{this.searchTransactions(this.state.search)}}
                >
                <Text>Search</Text>
                </TouchableOpacity>
            </View>  
      

            <FlatList 
            data={this.state.allTransactions}
            renderItem={({item})=>(
                <View style={{borderBottomWidth:2}} >
                <Text>{"transaction:"+ item.transactionType } </Text>
                <Text>{"Student ID:"+ item.studentID} </Text>
                <Text>{"Book ID:"+ item.bookID} </Text>
                <Text>{"Date:" + item.date.toDate()} </Text>
            </View>
            )}
            keyExtractor={(item,index)=>{
                index.toString()
            }}
            onEndReached={this.fetchMoreTransaction}
            onEndReachedThreshold={0.7}
            >
                
                   
            </FlatList>
            </View>
           
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 20
    },
    searchBar:{
      flexDirection:'row',
      height:40,
      width:'auto',
      borderWidth:0.5,
      alignItems:'center',
      backgroundColor:'grey',
  
    },
    bar:{
      borderWidth:2,
      height:30,
      width:300,
      paddingLeft:10,
    },
    searchButton:{
      borderWidth:1,
      height:30,
      width:50,
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:'green'
    }
  })
  