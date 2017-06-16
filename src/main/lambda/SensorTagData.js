console.log('Loading event'); 
var AWS = require('aws-sdk');
var path = require('path');


var dynamodb = new AWS.DynamoDB();
var iotData = new AWS.IotData({endpoint: 'abc.amazonaws.com'});

var esDomain = {
    region: 'us-east-1',
    endpoint: 'abc123.amazonaws.com',
    index: 'sensortag',
    doctype: 'TAG1'
};
var endpoint = new AWS.Endpoint(esDomain.endpoint);
var creds = new AWS.EnvironmentCredentials('AWS');


exports.handler = (event, context, callback) => {
    console.log("Request received:\n", JSON.stringify(event));
    console.log("Context received:\n", JSON.stringify(context));

    var payloadObj={ "state": {
                    "reported": {
                            "device": event.DeviceID,
                            "deviceName": event.DeviceName,
                            "eventDate": event.WhenCreated,
                            "time": event.time,
                            "AmbientTemp": event.AmbientTemp,
                            "Barometer": event.Barometer,
                            "Altitude": event.Altitude,
                            "Humidity": event.Humidity,
                            "IRTemp": event.IRTemp,
                            "Lux": event.Lux,
                            "GyroX": event.GyroX, 
                            "GyroY": event.GyroY, 
                            "GyroZ": event.GyroZ,
                            "MagX": event.MagX, 
                            "MagY": event.MagY, 
                            "MagZ": event.MagZ,
                            "x_Accelerator": event.AccX, 
                            "y_Accelerator": event.AccY, 
                            "z_Accelerator": event.AccZ
                                },
                            }
                };
        
    var paramsUpdate = {
        thingName : event.DeviceName,
        payload : JSON.stringify(payloadObj)
    };
    
    
    //This function will Update the Device Shadow State
    iotData.updateThingShadow(paramsUpdate, function(err, data) {
      if (err){
        console.log("Error in updating the Thing Shadow");
        console.log(err, err.stack);
            }
    });
    
    dynamodb.putItem({
            "TableName": event.DeviceName,
            "Item": {
                "deviceId": {
                    "S": event.DeviceID
                }, 
                "deviceName": {
                    "S": event.DeviceName
                }, 
                "time": {
                    "S": event.time.toString()
                },
                "eventDate": {
                    "S": event.WhenCreated
                },
                "AmbientTemp": {
                    "S": event.AmbientTemp.toString()
                },
                "Altitude": {
                    "S": event.Altitude.toString()
                },
                "Barometer": {
                    "S": event.Barometer.toString()
                },
                "Humidity": {
                    "S": event.Humidity.toString()
                },
                "IRTemp": {
                    "S": event.IRTemp.toString()
                },
                "Lux": {
                    "S": event.Lux.toString()
                },
                "x_Accelerator": {
                    "S": event.AccX.toString()
                },
                "y_Accelerator": {
                    "S": event.AccY.toString()
                },
                "z_Accelerator": {
                    "S": event.AccZ.toString()
                },
                "GyroX": {
                    "S": event.GyroX.toString()
                },
                "GyroY": {
                    "S": event.GyroY.toString()
                },
                "GyroZ": {
                    "S": event.GyroZ.toString()
                },
                "MagX": {
                    "S": event.MagX.toString()
                },
                "MagY": {
                    "S": event.MagY.toString()
                },
                "MagZ": {
                    "S": event.MagZ.toString()
                }
            }
        },
    
        function(err, data){
            if (err) {
                //context.succeed('SUCCESS');
                console.log("Error in updating dynamodb");
                console.log(err, err.stack);
            } else {
                console.log('Dynamo Success: ' + JSON.stringify(data, null, ' '));
                //context.succeed('SUCCESS');
            }
        }); 
        
        
        // Next publish data to ElasticSearch Service
        console.log ("Calling ElasticSearch Publish");
        var doc = JSON.stringify(payloadObj);
        var req = new AWS.HttpRequest(endpoint);
        req.method = 'POST';
        req.path = path.join('/', esDomain.index, esDomain.doctype);
        req.region = esDomain.region;
        req.headers['presigned-expires'] = false;
        req.headers['Host'] = endpoint.host;
        req.body = doc;
    
        var signer = new AWS.Signers.V4(req , 'es');  // es: service code
        signer.addAuthorization(creds, new Date());

        var send = new AWS.NodeHttpClient();
        send.handleRequest(req, null, function(httpResp) {
            var respBody = '';
            httpResp.on('data', function (chunk) {
                respBody += chunk;
            });
            httpResp.on('end', function (chunk) {
                console.log('Response: ' + respBody);
                //return pixel
                context.succeed('SUCCESS');
            });
        }, function(err) {
            console.log('Error: ' + err);
            //return pixel
            context.fail('ES Publish failed: ' + err);
        });
};
