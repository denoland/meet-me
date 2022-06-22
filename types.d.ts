// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

declare const google: GoogleApi;
declare const party: Party;

interface IdConfiguration {
  client_id: string;
  callback: (res: { credential: string }) => void;
}

interface GoogleApi {
  accounts: {
    id: {
      initialize(conf: IdConfiguration): void;
      renderButton(el: Element, opts: unknown): void;
    };
    // deno-lint-ignore no-explicit-any
    oauth2: any;
  };
}

interface Party {
  confetti(...args: unknown[]);
  variation: {
    range(x: number, y: number);
  };
}
