import { ApolloServer } from "apollo-server-express";
import express from "express";
import path from "path";

import { createResolvers } from "./resolvers";
import { typeDefs } from "./type-defs";

import { TopLevelScheduler } from "../top-level-scheduler/top-level-scheduler";

export function startServer(topLevelScheduler: TopLevelScheduler) {
  return new Promise(resolve => {
    const resolvers = createResolvers(topLevelScheduler);

    const app = express();

    app.use(express.static(path.join(__dirname, "/../../../client/build")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname + "/../../../client/build/index.html"));
    });

    const graphQLServer = new ApolloServer({ typeDefs, resolvers });

    graphQLServer.applyMiddleware({ app });

    const httpServer = app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀  Server ready at ${process.env.PORT || 5000}`);
      resolve();
    });

    // This is for future GraphQL subscriptions, though there are none currently.
    graphQLServer.installSubscriptionHandlers(httpServer);
  });
}
