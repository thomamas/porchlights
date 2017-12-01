/* Copyright 2017 Thomas Insel <tinsel@tinsel.org>
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS
 * IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied.  See the License for the specific language
 * governing permissions and limitations under the License.
 */

const outletCount = process.env.OUTLET_COUNT;
const bucket = process.env.BUCKET;
const key = encodeURIComponent(process.env.KEY);

var AWS = require('aws-sdk');

var s3 = new AWS.S3({
  params: {
      Bucket : bucket,
      Key : key,
      ACL : "public-read" }
});

exports.handler = (event, context, callback) => {

    var outlet;

    if (event.pathParameters) {
        outlet = parseInt(event.pathParameters.outlet, 10);
        if (isNaN(outlet)) { callback(null, cb(400, "invalid query")) }
        if (outlet > outletCount || outlet < 0) { callback(null, cb(400, "out of range")) }
    } else {
        outlet = 0;
    }
    
    if (event.httpMethod == "GET") {
        
        processGet(callback, outlet);
        
    } else if (event.httpMethod == "PUT" || event.httpMethod == "POST") {
        
        if (event.isBase64Encoded) {
            callback(null, cb(400, "base64 encoding not supported"));
        }
        
        var newState;
        
        if (outlet === 0) {
            newState = event.body;
            if (newState.length != outletCount) {
                callback(null, cb(400, "invalid state length"));
            }
        } else {
            newState = (event.body + 'x').substr(0, 1);
        }
        
        if (! validState(newState)) {
            callback(null, cb(400, "invalid state"));
        }
            
        processPut(callback, outlet, newState);

    } else {
        
        callback(null, cb(400, "unsupported method"));
        
    }

};

function validState(s) {
    return /^([01]+)$/.test(s);
}

function pad(s, c) {
    return (s + '0'.repeat(c)).substr(0, c);
}

function rstring(o, os) {
    return o ? os.substr(o-1, 1) : os;
}

function cb(code, text) {
    return {
        isBase64Encoded : false,
        statusCode : code,
        headers : {
            "X-Powered-By" : "rum"
        },
        body : text
    };
}

function setCharAt(str, index, chr) {
    if (index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}

function processGet(callback, outlet) {
    
    s3.getObject(null, (err, data) => {

        if (err) {
            callback(err); // API Gateway will return server error
        }

        if (! validState(data.Body.toString())) {
            callback(null, cb(400, "corrupt state data"));
        }
        
        var stateString = pad(data.Body.toString(), outletCount);
        callback(null, cb(200, rstring(outlet, stateString)));

    });
    
}

function processPut(callback, outlet, newState) {

    function putData(s, c) {
        s3.putObject({ Body : s }, (err, data) => {
            if (err) { c(err); }
            c(null, cb(200, s));
        });
    }

    if (outlet === 0) {
        putData(newState, callback);
    }

    s3.getObject(null, (err, data) => {

        if (err) {
            callback(err);
        }

        if (! validState(data.Body.toString())) {
            callback(null, cb(400, "corrupt state data"));
        }

        var oldStateString = pad(data.Body.toString(), outletCount);
        var newStateString = setCharAt(oldStateString, outlet - 1, newState);
        putData(newStateString, callback);
        
    });

}
