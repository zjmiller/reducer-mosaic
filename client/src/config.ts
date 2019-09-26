export const GRAPHQL_API_URL_HTTP =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/graphql"
    : `https://${window.location.hostname}/graphql`;

export const GRAPHQL_API_URL_WS =
  window.location.hostname === "localhost"
    ? "ws://localhost:5000/graphql"
    : `wss://${window.location.hostname}/graphql`;
