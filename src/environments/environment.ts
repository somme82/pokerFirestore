// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyAGEPphOhxncNGIuFyGrtEt9886MV_KvkE",
    authDomain: "friday-night-poker-crew.firebaseapp.com",
    databaseURL: "https://friday-night-poker-crew.firebaseio.com",
    projectId: "friday-night-poker-crew",
    storageBucket: "friday-night-poker-crew.appspot.com",
    messagingSenderId: "944744993714"
  }
};
