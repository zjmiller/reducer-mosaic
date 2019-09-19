import React from "react";
import { ApolloProvider } from "react-apollo";
import ReactDOM from "react-dom";

import { client } from "./apolloClient";
import * as serviceWorker from "./serviceWorker";

import App from "./components/App";

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
