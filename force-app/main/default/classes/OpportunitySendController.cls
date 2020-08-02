public with sharing class OpportunitySendController {
public OpportunitySendController() {}

@AuraEnabled(cacheable=true)
public static string sendOpportunityRecord(string endpointUrl){
    String authCode=null;
    String strResponse=null;
    String getAcctokenUrl='https://api.box.com/oauth2/token';
        HttpRequest httpRequest = new HttpRequest();  
        httpRequest.setEndpoint(endpointUrl);
        httpRequest.setMethod('GET');
         
        // // httpRequest.setMethod('POST');   
        // // HttpRequest.setHeader('Accept', 'application/json');
        // // HttpRequest.setBody('grant_type=authorization_code&client_secret=fMUcY4Ed1VSPhprISrGeCKJoLeUaK1Z3&client_id=0ejtsofh7irb7lef7zloz1ibfi6qcqz5'); 
        
         try {  
             Http http = new Http();   
             HttpResponse httpResponse = http.send(httpRequest);  
             System.debug(httpResponse.getStatusCode());
            if (httpResponse.getStatusCode() == 200 ) {
                 strResponse=httpResponse.getBody();  
             } 
             else {  
                 throw new CalloutException(httpResponse.getBody());  
             }   
         } 
         catch(Exception ex) {  
             throw ex;  
         }
        //new PageReference ('https://account.box.com/api/oauth2/authorize?response_type=code&client_id=0ejtsofh7irb7lef7zloz1ibfi6qcqz5');
    	//authCode=apexpages.currentpage().getparameters().get('code');
        HttpRequest req = new HttpRequest();
        req.setEndpoint(getAcctokenUrl); 

        req.setMethod('POST');   
        req.setHeader('Accept', 'application/json');
        req.setBody('grant_type=authorization_code&code='+authCode+'&client_secret=fMUcY4Ed1VSPhprISrGeCKJoLeUaK1Z3&client_id=0ejtsofh7irb7lef7zloz1ibfi6qcqz5'); 
    

        try {  
            Http h = new Http();   
            HttpResponse res = h.send(req);  

            if (res.getStatusCode() == 200 ) {
                strResponse=res.getBody();
                System.debug(strResponse);  
            } 
            else {  
                throw new CalloutException(res.getBody());  
            }   
        } 
        catch(Exception ex) {  
            throw ex;  
        }
    return null;
}
}