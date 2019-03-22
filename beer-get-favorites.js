import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
    const params = {
        TableName: "Beer",
        KeyConditionExpression: "userId = :userId",
        FilterExpression: "favoriteIndicator = :favoriteIndicator",
        ExpressionAttributeValues: {
            ":userId": event.requestContext.identity.cognitoIdentityId,
            ":favoriteIndicator": true,
        }
    };

    try {
        const result = await dynamoDbLib.call("query", params);
        return success(result.Items);
    } catch (e) {
        return failure({ status: false, e });
    }
}
