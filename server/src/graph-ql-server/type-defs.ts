import gql from "graphql-tag";

export const typeDefs = gql`
  scalar JSON
  scalar JSONObject

  type Mutation {
    createCopyOfRun(runId: ID, index: Int): Boolean
    findWorkForUser(userId: ID): JSON
    submitReply(reply: JSON, userId: ID): Boolean
    totalReset: Boolean
    adminAction(runId: ID, action: JSON): Boolean
  }

  type Query {
    run(id: ID): Run
    runs: [Run]
  }

  type Run {
    id: ID
    history: JSON
    pastState(index: Int): JSON
    state: JSON
  }
`;
