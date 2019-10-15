import uuid from "uuid";
import * as dynamoDbLib from './libs/dynamodb-lib';
import { success, failure } from './libs/response-lib';

export async function main(event, context, callback) {
    // Request body is passed in as a JSON encoded string in 'event.body'
    const data = JSON.parse(event.body);
    const params = {
        TableName: "Beer",
        // 'Item' contains the attributes of the item to be created
        // - 'userId': user identities are federated through the
        //             Cognito Identity Pool, we will use the identity id
        //             as the user id of the authenticated user
        // - 'noteId': a unique uuid
        // - 'createdAt': current Unix timestamp
        Item: {
            userId: event.requestContext.identity.cognitoIdentityId,
            beerId: uuid.v1(),
            breweryName: data.breweryName,
            breweryLocation: data.breweryLocation,
            beerName: data.beerName,
            beerStyle: data.beerStyle,
            beerNotes: data.beerNotes,
            approvedIndicator: data.approvedIndicator,
            favoriteIndicator: data.favoriteIndicator,
            createdDate: Date.now()
        }
    };

    const checkIfRecordExistsParams = {
        TableName: "Beer",
        KeyConditionExpression: "userId = :userId",
        FilterExpression: "contains (breweryName , :searchBreweryName) and contains (beerName, :searchBeerName) and contains (breweryLocation, :searchBreweryLocation)",
        ExpressionAttributeValues: {
            ":userId": params.Item.userId,
            ":searchBreweryName": params.Item.breweryName,
            ":searchBreweryLocation": params.Item.breweryLocation,
            ":searchBeerName": params.Item.beerName
        }
    };

    const result = await dynamoDbLib.call("query", checkIfRecordExistsParams);
    if (result.Items.length > 0) {
        throw new Error("Record already exists");
    }

    try {

        await dynamoDbLib.call("put", params);
        return success(params.Item);
    } catch (e) {
        return failure({ status: false, message: e.message });
    }
}