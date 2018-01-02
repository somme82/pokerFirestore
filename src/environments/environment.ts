// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyAdmmjcckyobpJ781zBtjUdMdOUtejL_b8",
    authDomain: "fnp-crew.firebaseapp.com",
    databaseURL: "https://fnp-crew.firebaseio.com",
    projectId: "fnp-crew",
    storageBucket: "",
    messagingSenderId: "389993943760"
  }
};
