public with sharing class BoxController {

    public String authCode=null;
    public void getAccesstoken(){
        String strResponse=null;
        String getAcctokenUrl='https://api.box.com/oauth2/token';
        authCode = apexpages.currentpage().getparameters().get('code');
            system.debug(authCode);
            HttpRequest req = new HttpRequest();
            req.setEndpoint(getAcctokenUrl); 
    
            req.setMethod('POST');   
            req.setHeader('Accept', 'application/json');
            req.setBody('grant_type=authorization_code&code='+authCode+'&client_secret=fMUcY4Ed1VSPhprISrGeCKJoLeUaK1Z3&client_id=0ejtsofh7irb7lef7zloz1ibfi6qcqz5'); 
            try {  
                Http http = new Http();   
                HttpResponse res = http.send(req);  
                System.debug(res.getStatusCode());
               if (res.getStatusCode() == 200 ) {
                    strResponse=res.getBody(); 
                    fromJSON d=(fromJSON) JSON.deserialize(strResponse, fromJSON.class); 
                    System.debug('access token✌'+d.access_token);
                    uploadFile(d.access_token);
                } 
                else {  
                    throw new CalloutException(res.getBody());  
                }   
            } 
            catch(Exception ex) {  
                throw ex;  
            }
            
        }

        //
//Generated by AdminBooster
//

    public class fromJSON{
        public String access_token;	//c3FIOG9vSGV4VHo4QzAyg5T1JvNnJoZ3ExaVNyQWw6WjRsanRKZG5lQk9qUE1BVQ
        public Integer expires_in;	//3600
        public String issued_token_type;	//urn:ietf:params:oauth:token-type:access_token
        public String refresh_token;	//c3FIOG9vSGV4VHo4QzAyg5T1JvNnJoZ3ExaVNyQWw6WjRsanRKZG5lQk9qUE1BVQ
        public cls_restricted_to[] restricted_to;
        public String token_type;	//bearer

    }
    class cls_restricted_to {
    }


    public void uploadFile(String token){
        String attributes='{"name":"testing.txt", "parent":{"id":"0"}}';
        String content='file=@testing.txt';
        //String attributes='attributes.name="testing.txt"&attributes.parent.id="115461133037"';
        Http h=new Http();
        HttpRequest req=new HttpRequest();
        req.setEndpoint('https://upload.box.com/api/2.0/files/content');
        req.setMethod('POST');
        //req.setHeader('Accept', 'application/text');
        req.setHeader('Content-Type', 'multipart/form-data');
        req.setHeader('Authorization', 'Bearer '+token);
        req.setBody(attributes);
        req.setBody(content);
        try{
        HttpResponse res=h.send(req);
        System.debug('file upload code😉'+res.getStatusCode());
        }catch(Exception e){
            System.debug(e);
        }
    }

}
