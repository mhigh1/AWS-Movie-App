require('dotenv').config();
const request = require('request');
const AWS = require('aws-sdk');
AWS.config.update({
  region: 'us-east-2',
  endpoint: 'http://dynamodb.us-east-2.amazonaws.com',
  accessKeyId: process.env.ClientID,
  secretAccessKey: process.env.ClientSecret
});

exports.handler = function(event, context, callback) {
    const title = event.queryStringParameters.title;
    const apiKey = event.queryStringParameters.apikey;
    const queryUrl = `https://www.omdbapi.com/?t=${title}&y=&plot=short&apikey=${apiKey}`;
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName:"awsMovieAppDB",
        Item:{
            name: 'Lambda Entry',
            type : 'HTTP',
            title: title,
            timestamp: String(new Date().getTime())
        }
    };

    request(queryUrl, function(error, res, body) {
        if (!error && res.statusCode === 200) {
            const response = {
                isBase64Encoded: true,
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "content-type": "application/json"
                },
                body: res.body
            };

            docClient.put(params, function(err, data) {
                if (err) {
                    console.error('Unable to add item. Error JSON:', JSON.stringify(err, null, 2));
                } else {
                    console.log("Added item:", JSON.stringify(data, null, 2));
                }
            });

            callback(null, response);
        };
    });
};