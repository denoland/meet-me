# 2. Utilise supabase for persistance

Date: 2022-05-02

## Status

Superceded by
[4. Use firestore as the persistance layer.](0004-use-firestore-as-the-persistance-layer.md)

## Context

We need to persist information about users, the configuration for the user and
other information.

Because the nature of data is heavy user and role based, it makes sense to use a
solution the provides clean APIs for such integration, instead of having to add
a layer on top to help ensure that we don't "leak" data from user to user.

An application framework like Firebase is well suited for the task. supabase is
an open source alternative to Firebase which provides similar persistance
functionality built on top of a Postgres database, but with abstractions around
user data. supabase is also a start-up leveraging Deno Deploy as a compute
layer.

## Decision

Utilize supabase as the persistance layer.

## Consequences

Using emergent open source technology always comes with its risks. There is no
clear migration from supabase to other platforms if it appears to be
insufficient, but we are likely to have good conversations about any product
features or issues.
