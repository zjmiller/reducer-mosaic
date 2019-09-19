export const GRAPHQL_API_URL_HTTP =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/graphql"
    : `https://${window.location.hostname}/graphql`;

export const GRAPHQL_API_URL_WS =
  window.location.hostname === "localhost"
    ? "ws://localhost:5000/graphql"
    : `wss://${window.location.hostname}/graphql`;

export const GUEST_USER_ID = "a75b3cb2-2f57-4068-afaa-1c432ee8a78c";
