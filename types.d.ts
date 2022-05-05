// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

declare const google: GoogleApi;
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
  };
}
