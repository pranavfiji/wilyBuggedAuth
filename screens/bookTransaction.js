import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View,Image,Alert,KeyboardAvoidingView,ToastAndroid} from 'react-native';
import * as Permissions from "expo-permissions";
import {BarCodeScanner} from "expo-barcode-scanner";
import firebase from "firebase"
import db from "../config"

export default class TransactionScreen extends React.Component{
    constructor(){
        super();
        this.state={
            hasCameraPermissions: null,
            scanned: false,
            scannedData: '',
            buttonState:"normal",
            scanBookID:'',
            scanStudentID:'',
            transactionMessage:'',

        }
    }
    getCameraPermissions=async(id)=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA);
       alert(id);
        this.setState({
            /*status === "granted" is true when user has granted permission status ===
             "granted" is false when user has not granted the permission */
            hasCameraPermissions:status==='granted',
            buttonState:id,
            scanned:false
        })
        alert(this.state.hasCameraPermissions)
        
    }
    handleBarCodeScanned = async({type, data})=>{
        alert("handle barcode called")
        const {buttonState}=this.state;
        if(buttonState==="bookID"){
            this.setState({
                scanned: true,
                scanBookID: data,
                buttonState: 'normal'
                });
        }
        else if(buttonState==="studentID"){
            this.setState({
                scanned: true,
                scanStudentID: data,
                buttonState: 'normal'
                });
        }
        
        alert(`Bar code with type ${type} and data ${data} has been scanned!`);
        }
    /* db.collection(<collectionName>).doc(<docId>).get() 
    When the document is received, we can call .then()
     to do whatever we want to do with the document. .then()
     receives the document as a default
        argument
        doc.data() is used to get all the
        information stored in the document.
    */
   // querie is interaction with database and fetching information based on the condition
        handleTransaction=async()=>{
            var transactionType=await this.checkBookEligibility();
            console.log(transactionType);
            if(!transactionType){
                alert("The book does not exit in the database itself");
                this.setState({
                    scanBookID:"",
                    scanStudentID:"",

                })
            }else if(transactionType==="issue"){
                var isStudentEligible=await this.checkStudentEligibilityForBookIssue();
                if(isStudentEligible){
                    this.initiateBookIssue();
                    alert("Book Issue to the Student");
                    //  ToastAndroid.show("Book Issue to Student",ToastAndroid.SHORT);


                }
            }else{
                var isStudentEligible=await this.checkStudentEligibilityForBookReturn();
                if(isStudentEligible){
                    this.initiateBookReturn();
                    alert("Book Returned to the Libary");
                    //  ToastAndroid.show("Book Issue to Student",ToastAndroid.SHORT);


                } 
            }
            
        }

        checkStudentEligibilityForBookIssue = async () => {
            const studentRef = await db
              .collection("students")
              .where("studentID", "==", this.state.scanStudentID)
              .get();
            var isStudentEligible = "";
            if (studentRef.docs.length == 0) {
              this.setState({
                scanStudentID: "",
                scanBookID: ""
              });
              isStudentEligible = false;
              alert("The student id doesn't exist in the database!");
            } else {
              studentRef.docs.map(doc => {
                var student = doc.data();
                if (student.numberBooksIssued< 2) {
                  isStudentEligible = true;
                } else {
                  isStudentEligible = false;
                 alert("The student has already issued 2 books!");
                  this.setState({
                    scanStudentID: "",
                    scanBookID: ""
                  });
                }
              });
            }
        
            return isStudentEligible;
          };

          checkStudentEligibilityForBookReturn = async () => {
            const transactionRef = await db
              .collection("transaction")
              .where("bookID", "==", this.state.scanBookID).limit(1)
              .get();
            var isStudentEligible = "";
           
              transactionRef.docs.map(doc => {
                var lastBookTransaction = doc.data();
               if(lastBookTransaction.studentID===this.state.scanStudentID){
                   isStudentEligible=true;
               }else {
                    isStudentEligible=false;
                    alert("Book was not Issued to this Person");
                    this.setState({
                    scanStudentID:"",
                    scanBookID:"",
                    })
               }
              });
            
        
            return isStudentEligible;
          };

          checkBookEligibility = async () => {
            console.log("checkBookEligibilityStarted"+this.state.scanBookID);
            const bookRef = await db
              .collection("Books")
              .where("bookID", "==", this.state.scanBookID)
              .get();
              console.log(bookRef.docs)
            var transactionType = "";
            if (bookRef.docs.length == 0) {
              transactionType = false;
            } else {
              bookRef.docs.map(doc => {
                var book = doc.data();
                if (book.bookAvailability) {
                  transactionType = "issue";
                } else {
                  transactionType = "return";
                }
              });
            }
        
            return transactionType;
          };


          initiateBookIssue = async ()=>{
            //add a transaction
            db.collection("transaction").add({
              'studentID' : this.state.scanStudentID,//this.state.scannedStudentId -STG06A12
              'bookID' :this.state.scanBookID,//this.state.scannedBookId-BSC001
              'date' : firebase.firestore.Timestamp.now().toDate(),
              'transactionType' : "Issue"
            })
        console.log(this.state.scanBookID);
        console.log(this.state.scanStudentID);
            //change book status
            db.collection("Books").doc(this.state.scanBookID).update({
              'bookAvailability' : false
            })
            //change number of issued books for student
            db.collection("students").doc(this.state.scanStudentID).update({
              'numberBooksIssued' : firebase.firestore.FieldValue.increment(1)
            })
            alert("Book Issued");
            this.setState({
             scanBookID : '',
              scanStudentID: ''
            })
          }
          initiateBookReturn = async ()=>{
            //add a transaction
            db.collection("transaction").add({
              'studentID' : this.state.scanStudentID,//this.state.scannedStudentId -STG06A12
              'bookID' :this.state.scanBookID,//this.state.scannedBookId-BSC001
              'date' : firebase.firestore.Timestamp.now().toDate(),
              'transactionType' : "Return"
            })
        
            //change book status
            db.collection("Books").doc(this.state.scanBookID).update({
              'bookAvailability' : true
            })
            //change number of issued books for student
            db.collection("students").doc(this.state.scanStudentID).update({
              'numberBooksIssued' : firebase.firestore.FieldValue.increment(-1)
            })
        alert("Book Return");
            this.setState({
             scanBookID : '',
              scanStudentID: ''
            })
          }
    render(){
        const hasCameraPermissions = this.state.hasCameraPermissions;
        const scanned=this.state.scanned;
        const buttonState=this.state.buttonState;
     // multiple instructions then use if statement if one one instruction only use ternary operator.
        if (buttonState != "normal" && hasCameraPermissions){
            // the return contains the html comand and the rest of the areas we use JavaScript. 
            //If we want to use javascript inside the return use '{}'
            return(
              <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
              />
            );
          }
    
        else if (buttonState === "normal"){
            return(
          
            <KeyboardAvoidingView style={styles.container}
            behavior="padding" 
            enabled
            >
                <View>
                    <Image style={{width:200,height:200}} source={require("../assets/appImg.jpg")}></Image>
                </View>
                <View style={styles.inputView}>
                    <TextInput
                    style={styles.inputBox}
                    placeholder="Book ID"
                    value={this.state.scanBookID}
                    onChangeText={text =>this.setState({scanBookID:text})}

                    />
                    <TouchableOpacity style={styles.scanButton}
                    onPress={()=>{
                        this.getCameraPermissions("bookID");
                    }}
                    > 
                        <Text style={styles.buttonText}>Scan</Text>
                    </TouchableOpacity>
                
                   
                </View>
                <View style={styles.inputView}>
                    <TextInput
                    style={styles.inputBox}
                    placeholder="Student ID"
                    value={this.state.scanStudentID}
                    onChangeText={text =>this.setState({scanStudentID:text})}
                    />
                    <TouchableOpacity style={styles.scanButton}
                     onPress={()=>{
                        this.getCameraPermissions("studentID");
                    }}
                    > 
                        <Text style={styles.buttonText}>Scan</Text>
                    </TouchableOpacity>


                   
                </View>
                    <TouchableOpacity style={styles.submitButton}
                    onPress={async()=>{
                        this.handleTransaction();
                        
                    }}
                    >
                        <Text style={styles.submitButtonText}> Submit </Text>
                    </TouchableOpacity>
            </KeyboardAvoidingView>
            );
          }
     
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scanButton:{
        backgroundColor:"grey",
         width:50,
        borderWidth:2,
        backgroundColor:"red"

    },
    displayText:{
        fontSize:15,
        textDecorationLine:"underline",
        

    },
    buttonText:{
        fontSize:15,
        textAlign:"center",
        marginTop:10,


    },
    inputView:{
        flexDirection:"row",
        margin:20,

    },
    inputBox:{
        width:200,
        height:40,
        borderWidth:2,
        fontSize:20,

    },
    submitButton:{
        backgroundColor:"grey",
        width:100,
        height:50,
        borderWidth:2,
        borderColor:"red",



    },
    submitButtonText:{
            padding:10,
            textAlign:"center",
            fontSize:20,
            fontWeight:"bold",
            color:"white"

    }
    

  });
