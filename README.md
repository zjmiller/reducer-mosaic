# Overview

Rapidly built Mosaic prototype illustrating a reducer-based approach. Implements runs with easily accessible state/history so that there's (1) full time-travel, (2) the ability to copy a run at any point in time, and (3) the ability to create admin actions that can influence run state in pretty much any way you want.

Check out the directory structure of [server/src](server/src) to get a feel for the main abstractions. Obviously the run/script/interaction terminology comes from Mosaic2. As a side note, in this new context, the term "script" makes less sense and should maybe be replaced.

Many particular abstraction details are orthogonal to the reducer debate. In fact, the `IScript` interface in [server/src/script/index.ts](server/src/script/index.ts) doesn't even require a reducer-based implementation.
