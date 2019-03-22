import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
    const data = JSON.parse(event.body);
    const params = {
        TableName: "Beer",
        Key: {
            userId: event.requestContext.identity.cognitoIdentityId,
            beerId: event.pathParameters.id
        },
        UpdateExpression: "SET breweryName = :breweryName, breweryLocation = :breweryLocation, beerName = :beerName, beerStyle = :beerStyle, beerNotes = :beerNotes, approvedIndicator = :approvedIndicator, favoriteIndicator = :favoriteIndicator",
        ExpressionAttributeValues: {
            ":breweryName": data.breweryName || null,
            ":breweryLocation": data.breweryLocation || null,
            ":beerName": data.beerName || null,
            ":beerStyle": data.beerStyle || null,
            ":beerNotes": data.beerNotes || null,
            ":approvedIndicator": data.approvedIndicator || false,
            ":favoriteIndicator": data.favoriteIndicator || false
        },
        // 'ReturnValues' specifies if and how to return the item's attributes,
        // where ALL_NEW returns all attributes of the item after the update; you
        // can inspect 'result' below to see how it works with different settings
        ReturnValues: "ALL_NEW"
    };

    try {
        const result = await dynamoDbLib.call("update", params);
        return success({ status: true });
    } catch (e) {
        return failure({ status: false });
    }
}
