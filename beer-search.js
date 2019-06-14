import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
    const params = {
        TableName: "Beer",
        KeyConditionExpression: "userId = :userId",
        FilterExpression: "contains (breweryName , :searchQuery) or contains (beerName, :searchQuery) or contains (breweryLocation, :searchQuery)",
        ExpressionAttributeValues: {
            ":userId": event.requestContext.identity.cognitoIdentityId,
            ":searchQuery": decodeURI(event.pathParameters.query),
        }
    };

    try {
        const result = await dynamoDbLib.call("query", params);
        return success(result.Items);
    } catch (e) {
        return failure({ status: false, e });
    }
}
