public with sharing class ConnectToHeroku {

    @AuraEnabled(cacheable=true)
    public static String callout(Id recordId,String OppName){
        System.debug('this is record id'+recordId);
//STEP 1 :------fetching opportunity by row id---------
        DescribeSObjectResult describeResult = recordId.getSObjectType().getDescribe();	
        SObject records = Database.query( ' SELECT ' +String.join( new List<String>( describeResult.fields.getMap().keySet() ), ',' ) +' FROM ' +describeResult.getName() +' WHERE ' +' id = :recordId ' );
        String str=String.valueOf(records);	
        System.debug( str );
        return makePostCallout(str,OppName);
        //System.debug('getting ends...');
    }

    public static String makePostCallout(String str, String OppName ) {
        System.debug('getting ...');
        String statusCode;
        String status;
        String body;
        String header;
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://th-apex-http-callout.herokuapp.com/animals');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json;charset=UTF-8');
        if(str!=null && OppName!=null){
        	String recordDetails = '{"name":"'+OppName+'->'+str+'"}';
            req.setBody(recordDetails);
        }
        HttpResponse res = h.send(req);
        if (res.getStatusCode() != 201) {
            System.debug('The status code returned was not expected: ' +
                res.getStatusCode() + ' ' + res.getStatus());
                return String.valueOf(res.getStatusCode())+','+String.valueOf(res.getStatus());
        } else {
            System.debug('all available :'+res.getBody());
			statusCode = String.valueOf(res.getStatusCode());
            status = String.valueOf(res.getStatus());
            body = String.valueOf(res.getBody());
            header = String.valueOf(res.getHeader('Content-Type'));
            return statusCode+','+status;
            //update new Opportunity(Id = recordId, Integration_Comments__c='Success');
        }
    }
}