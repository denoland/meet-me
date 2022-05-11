# 4. Use firestore as the persistance layer.

Date: 2022-05-10

## Status

Accepted

Supercedes
[2. Utilise supabase for persistance](0002-utilise-supabase-for-persistance.md)

## Context

One of the larger objectives of the showcase application is to have a diversity
of technologies integrated. The `showcase_chat` team has chosen supabase as the
persistance layer. The team reconsidered if supbase would be providing any
specific unique functionality and to re-evaluate other suitable technologies.

We considered:

- spanner
- Edge.db
- Firebase/Firestore
- Prisma

Considering the dependency on other Google APIs (Calendar) and the user centric
nature of the application, Firebase/Firestore appears to be the best solution
and demonstrates integration of a popular platform for applications.

## Decision

We will use Firebase/Firestore instead of Supabase.

## Consequences

Firebase/Firestore are well documented APIs, though their integration into Deno
Deploy is somewhat experimental. There maybe unseen challenges.

Management of the solution though should be easier, as Firebase is integrated
into the suite of GCP services.
