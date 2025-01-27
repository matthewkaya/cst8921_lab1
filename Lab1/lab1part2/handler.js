const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const express = require("express");
const serverless = require("serverless-http");

const app = express();

const USERS_TABLE = process.env.USERS_TABLE;
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

app.use(express.json());

// GET Endpoint: Retrieve user by userId
app.get("/users/:userId", async (req, res) => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  };

  try {
    const command = new GetCommand(params);
    const { Item } = await docClient.send(command);
    if (Item) {
      const { userId, name } = Item;
      res.json({ userId, name });
    } else {
      res
        .status(404)
        .json({ error: 'Could not find user with provided "userId"' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve user" });
  }
});

// POST Endpoint: Create a new user
app.post("/users", async (req, res) => {
  const { userId, name } = req.body;
  if (typeof userId !== "string") {
    return res.status(400).json({ error: '"userId" must be a string' });
  }
  if (typeof name !== "string") {
    return res.status(400).json({ error: '"name" must be a string' });
  }

  const params = {
    TableName: USERS_TABLE,
    Item: { userId, name },
  };

  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    res.json({ userId, name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create user" });
  }
});

// PUT Endpoint: Update user name by userId
app.put("/users/:userId", async (req, res) => {
  const { name } = req.body;
  const userId = req.params.userId;

  if (typeof name !== "string") {
    return res.status(400).json({ error: '"name" must be a string' });
  }

  const params = {
    TableName: USERS_TABLE,
    Key: { userId },
    UpdateExpression: "SET #n = :name",
    ExpressionAttributeValues: { ":name": name },
    ExpressionAttributeNames: { "#n": "name" },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const command = new UpdateCommand(params);
    const result = await docClient.send(command);
    res.json({ userId, name: result.Attributes.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update user" });
  }
});

// Fallback for unhandled routes
app.use((req, res) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
