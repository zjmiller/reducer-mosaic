# Overview

Rapidly built Mosaic prototype illustrating a reducer-based approach. Implements runs with easily accessible state/history so that there's (1) full time-travel, (2) the ability to copy a run at any point in time, and (3) the ability to create admin actions that can influence run state in pretty much any way you want.

Check out the directory structure of [server/src](server/src) to get a feel for the main abstractions. Obviously the run/script/interaction terminology comes from Mosaic2. As a side note, in this new context, the term "script" makes less sense and should maybe be replaced.

Many particular abstraction details are orthogonal to the reducer debate. In fact, the `IScript` interface in [server/src/script/index.ts](server/src/script/index.ts) doesn't even require a reducer-based implementation.

## Top-Level Scheduler

All users engage with the app via the top-level scheduler. Users can request work. And, after they've been assigned a bit of work, they can submit a reply.

## Run

A run is a combination of a script and run-level scheduler. The script itself should handle all scheduling logic that is essential to the nature of the script. The run-level scheduler should handle all scheduling logic that is non-essential to the nature of the script. By writing scripts and run-level schedulers in this way, we ensure we can replay scripts but potentially vary non-essential scheduling logic.

## Script

A script is the core of any run. Scripts handle script-level scheduling, provide state and history information, generate template information for their interactions, and must be able to make copies of themselves based on any point in their history. A natural way to accomplish this is with a reducer-based implementation, but that's not required.

## Scheduling

There are three places in which scheduling occurs: in the script itself, in the run-level scheduler, and in the top-level scheduler.

#### Script-Level Scheduling

Any scheduling constraints that are integral to the script itself should happen in the `getAllEligibleInteractionsForUser` method of the script.

#### Run-Level Scheduler

Any scheduling that is not integral to the script itself, but can occur without knowing about other runs, should happen here.

#### Top-Level Scheduling

Any scheduling that needs cross-run awareness happens here.
