import { LightningElement,api,track } from 'lwc';
import findOpportunities from '@salesforce/apex/OpportunitiesController.findOpportunities';
//import uploadFile from '@salesforce/apex/BoxController.uploadFile';     //trying to integrate box.com api calling fail
import sendingRecordToHeroku from '@salesforce/apex/ConnectToHeroku.callout';
import { updateRecord } from 'lightning/uiRecordApi';

import Integration_Comments__c_field from '@salesforce/schema/Opportunity.Integration_Comments__c';
import Integration_Status__c_field from '@salesforce/schema/Opportunity.Integration_Status__c';
import ID_FIELD from '@salesforce/schema/Opportunity.Id';

import { NavigationMixin } from 'lightning/navigation';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
//const delay=350;
const columns = [
    { label: 'Id', fieldName: 'Id' }, 
    { label: 'Name', fieldName: 'linkName' ,type:'url',typeAttributes:{
                                                        label:{fieldName:'Name'},
                                                        target:'_blank'}},
    { label: 'Account Name', fieldName: 'AccountlinkName' ,type:'url',typeAttributes:{
                                                        label:{fieldName:'AccountName'},
                                                        target:'_blank'}},
   // { label: 'Account Name', fieldName: 'AccountName' },
    { label: 'Stage Name', fieldName: 'StageName' }, 
    { label: 'Type', fieldName: 'Type' }, 
    { label: 'Amount', fieldName: 'Amount',type: 'currency', cellAttributes: { alignment: 'left' }}, 
    { type: "button",initialWidth: 90, typeAttributes: {  
        label: 'Send',  
        name: 'Send',  
        title: 'Send',  
        disabled: false,  
        value: 'send',  
        iconPosition: 'left'  
    }, cellAttributes: { alignment: 'left' } },     
];
let i=0,count=1;
export default class SearchPage extends NavigationMixin(LightningElement) {
    @track accounts;
    @track error;
    @track getStatus;
    @track value = 20;
    sVal = '';
    recId='';
    name='';
    isVisible = true;
    @track page = 1; //this will initialize 1st page
    @track items = []; //it contains all the records.
    @track data ; //data to be display in the table
    @track columns; //holds column info.
    @track startingRecord = 1; //start record position per page
    @track endingRecord = 0; //end record position per page
    @track pageSize = 20; //default value we are assigning
    @track totalRecountCount = 0; //total record count received from all retrieved records
    @track totalPage = 0; //total number of page is needed to display all records
    
    get options() {
        return [
                 { label: '5', value: 5 },
                 { label: '10', value: 10 },
                 { label: '15', value: 15 },
                 { label: '20', value: 20 },
               ];
    }

    handlePageChange(event) {
        this.pageSize = event.detail.value;
        console.log(this.pageSize);

        this.searchOpp();
     }

    handleVisible(event) {
        this.isVisible = !this.isVisible;
    }

    handleKeyChange(event) {
        this.sVal = event.target.value;
    }
    searchOpp(){
        if (this.sVal !== '') {
            findOpportunities({
                    searchKey: this.sVal
                })
                .then(result => {  
                    this.accounts = result;

                    console.log("Account details  "+JSON.stringify(this.accounts[0]));
                    var a=JSON.parse(JSON.stringify(this.accounts[0]));
                    console.log("Account details  "+a.Account.Name);
                    console.log("Account id"+this.accounts[0].Account.Name);
                    this.items = this.accounts;
                    this.totalRecountCount = this.accounts.length;
                    this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
                    this.items = this.accounts.map(record => Object.assign(
                        { "linkName": 'https://deepsubha16-dev-ed.lightning.force.com/lightning/r/Opportunity/'+record.Id+'/view',
                           "AccountlinkName": 'https://deepsubha16-dev-ed.lightning.force.com/lightning/r/Account/'+record.Account.Id+'/view'
                        },
                        record
                    ));
                    for(var i=0;i<this.accounts.length;i++){
                        this.items[i].AccountName=this.accounts[i].Account.Name;
                    }
                    this.data = this.items.slice(0,this.pageSize); 
                    this.endingRecord = this.pageSize;
                    this.columns = columns;
                })
                .catch(error => {
                    this.data = null;
                    const event = new ShowToastEvent({
                        title: 'Error',
                        variant: 'error',
                        message: error.body.message,
                    });
                    this.dispatchEvent(event);    
                });
        } else {
            this.data = null;
            // fire toast event if input field is blank
            const event = new ShowToastEvent({
                variant: 'error',
                message: 'Search text missing..',
            });
            this.dispatchEvent(event);
        }
            // window.clearTimeout(this.delayTimeout);
            // const searchKey = event.target.value;
            // this.delayTimeout = setTimeout(()=>{
            //     findOpportunities({searchKey})
            //     .then(results => {
            //         this.accounts = results;
            //         console.log(this.accounts.id);
            //         this.error = undefined;
            //     })
            //     .catch(error=>{
            //         this.error = error;
            //         this.accounts = undefined;
            //     });
            // },
            // delay);
    }

    //For Pagination----------->>
    // getData(data){
    //     this.items = data;
    //     this.totalRecountCount = data.length; //here it is 23
    //     this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); //here it is 5
        
    //     //initial data to be displayed ----------->
    //     //slice will take 0th element and ends with 5, but it doesn't include 5th element
    //     //so 0 to 4th rows will be display in the table
    //     this.data = this.items.slice(0,this.pageSize); 
    //     this.endingRecord = this.pageSize;
    //     this.columns = columns;

    // }

    previousHandler() {
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
    }

    //clicking on next button this method will be called
    nextHandler() {
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);            
        }             
    }

    displayRecordPerPage(page){

        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);

        this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                            ? this.totalRecountCount : this.endingRecord; 

        this.data = this.items.slice(this.startingRecord, this.endingRecord);

        this.startingRecord = this.startingRecord + 1;
    }

    //-----------call row action-----------
    //-----for box.com----------------------------------------
   // callRowAction( event ) { 
        //const recId =  event.detail.row.Id;
        // const name =  event.detail.row.Name;
        // const accountId =  event.detail.row.AccountId;
        // const stageName =  event.detail.row.StageName;
        // const type =  event.detail.row.Type;
        // //alert(recId+' '+name+' '+accountId+' '+stageName+' '+type);
        // var BoxSDK = require('box-node-sdk');                       //Integration with box.com
        // var sdk = new BoxSDK({
        //     clientID: '0ejtsofh7irb7lef7zloz1ibfi6qcqz5',
        //     clientSecret: 'fMUcY4Ed1VSPhprISrGeCKJoLeUaK1Z3'
        // });

        // // the URL to redirect the user to
        // var authorize_url = sdk.getAuthorizeURL({
        //     response_type: 'code'
        // });
        //console.log('here'+authorize_url);

    //     if(count==1){
    //         this[NavigationMixin.Navigate]({
    //             "type": "standard__webPage",
    //             "attributes": {
    //                 "url": "https://account.box.com/api/oauth2/authorize?response_type=code&client_id=0ejtsofh7irb7lef7zloz1ibfi6qcqz5&state=authenticated/"
    //             }
    //         });
    //     }  
    // }
//----------box.com ends------------------------heroku starts-----------------------------------
  
    callRowAction( event ) {
        this.recId =  event.detail.row.Id;
        this.name =  event.detail.row.Name;
        const accountId =  event.detail.row.AccountId;
        const stageName =  event.detail.row.StageName;
        const type =  event.detail.row.Type;
        console.log('start sending');

        sendingRecordToHeroku({
            recordId: this.recId,
            OppName: this.name,
        })
        .then(result=>{
            this.getStatus = result.split(",");

            console.log("status code"+this.getStatus[0]);
            console.log("status "+this.getStatus[1]);

            if(this.getStatus[0] === '201'){                                                  //checking status is 201-->true
               console.log('inside if');
                const fields = {};
                fields[ID_FIELD.fieldApiName] = this.recId;
                fields[Integration_Comments__c_field.fieldApiName] = this.getStatus[1];
                fields[Integration_Status__c_field.fieldApiName] = 'Success';

                const recordInput = { fields };
                updateRecord(recordInput)
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Opportunity Send and Integration status Success',
                            variant: 'success'
                        })
                    );
                    // Display fresh data in the form
                    //return refreshApex(this.contact);
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error creating record',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                });
            }else{
                console.log('inside if');
                const fields = {};
                fields[ID_FIELD.fieldApiName] = this.recId;
                fields[Integration_Comments__c_field.fieldApiName] = this.getStatus[1];
                fields[Integration_Status__c_field.fieldApiName] = 'Fail';

                const recordInput = { fields };
                updateRecord(recordInput)
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Sorry',
                            message: 'Sending failure Integration status fail',
                            variant: 'error'
                        })
                    );
                    // Display fresh data in the form
                    //return refreshApex(this.contact);
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error sending and saving record',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                });
            }

        })
        .catch(error=>{
            this.getStatus = result;
            console.log(this.getStatus);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Fail to Update',
                    message: 'Something went wrong',
                    variant: 'error',
                }),
            );
            this.error = error;
        });

        console.log('done sending!!');
    }

}
