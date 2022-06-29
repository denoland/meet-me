![](./doc/screenshot.png)

# Meet Me

> [calendly](https://calendly.com/) clone in Deno

## Google Trust and Safety verification

This app uses Google Calendar API and the app is now being reviewed by Google's
Trust and Safety team for verification. If you'd like to try this app by
yourself at this point, please click the below links and approve the app on your
own risk while signing in to the app.

![](./doc/screenshot_consent_screen0.png)

![](./doc/screenshot_consent_screen1.png)

## Development

First copy `.env.example` to `.env` and set `CLIENT_ID`, `CLIENT_SECRET`, and
`FIREBASE_*` appropriate values.

Then run the deployment locally:

```sh
deno task dev
```

This starts Meet Me service in your local machine.

## Testing

Start the firestore emulator by the below command (You need Node.js and Java >
11 to run the emulator):

```
deno task firestore-emulator
```

In another terminal window, run the below command to run the unit tests:

```
deno task test
```

## Visual Design

https://www.figma.com/file/P0XsTDIeiwNhm8jFS03gwz/Deno-Cal

## LICENSE

MIT License

## Notes

### How to configure GCP Project and get/create `CLIENT_ID` and `CLIENT_SECRET` values

You need [Google Cloud Platform](https://console.cloud.google.com/) Project to
develop this app.

- First go to [GCP Console](https://console.cloud.google.com/) and create a
  project.
- Then go to `APIs & Services`.
- Enable Calendar API from `+ ENABLE APIS AND SERVICES` link.
  ![](doc/enable-api.png)
- In `OAuth consent screen` tab, set up the project's consent screen.
- In `Credentials` tab, create `OAuth client ID` with `Web application` type.
- TODO(kt3k): document the parameters to set.
- Then you'll find client id and client secret of the oauth client.
- Copy those values and set them as `CLIENT_ID` and `CLIENT_SECRET`.

For Deno Land employees:

- You can find these values in `Meet Me API Credentials` section in the password
  manager.
