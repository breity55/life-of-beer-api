import uuid from "uuid";
import * as dynamoDbLib from './libs/dynamodb-lib';
import { success, failure } from './libs/response-lib';

export async function main(event, context, callback) {
    const data = JSON.parse(event.body);
    const params = {
        TableName: "Beer",
        requestorId: event.requestContext.identity.cognitoIdentityId
    };

    for (var i = 0; i < data.length; i++) {
        var newRecordParams = {
            TableName: params.TableName,
            Item: {
                userId: params.requestorId,
                beerId: uuid.v1(),
                breweryName: data[i].breweryName,
                breweryLocation: data[i].breweryLocation,
                beerName: data[i].beerName,
                beerStyle: data[i].beerStyle,
                beerNotes: data[i].beerNotes,
                approvedIndicator: (data[i].approvedIndicator === "true" || data[i].approvedIndicator === true) ? true : false,
                favoriteIndicator: (data[i].favoriteIndicator === "true" || data[i].favoriteIndicator === true) ? true : false,
                createdDate: Date.now()
            }
        }

        const checkIfRecordExistsParams = {
            TableName: newRecordParams.TableName,
            KeyConditionExpression: "userId = :userId",
            FilterExpression: "contains (breweryName , :searchBreweryName) and contains (beerName, :searchBeerName) and contains (breweryLocation, :searchBreweryLocation)",
            ExpressionAttributeValues: {
                ":userId": newRecordParams.Item.userId,
                ":searchBreweryName": newRecordParams.Item.breweryName,
                ":searchBreweryLocation": newRecordParams.Item.breweryLocation,
                ":searchBeerName": newRecordParams.Item.beerName
            }
        };

        const result = await dynamoDbLib.call("query", checkIfRecordExistsParams);
        if (result.Items.length <= 0) {
            try {
                await dynamoDbLib.call("put", newRecordParams);
                return success(data);
            } catch (e) {
                return failure({ status: false, message: e.message });
            }
        }
    }
}