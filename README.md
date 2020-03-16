# Tree Rotation Playground

This app allows the user to play around with tree rotations to get a better understanding of how self balancing binary
trees work. It was built for an "intro to algorithms" course.

## Running
There are two ways to run it. You may either run a dev server or build it. If you run a dev server, everything should work
out of the box but the files will be unminified. Alternatively, you can build the project but directly opening the file
in a browser probably won't work because the resource paths in the build are absolute, which prevents `file://` from properly
resolving them. To resolve this, you have two options. You may either a) host the files in a static server or b) manually patch
the resource path(s) by making them relative.

Whichever way you choose, you must first install the dependencies. The following snippet assumes you have node.js and npm installed:
```shell script
npm install
```

From there, you can use the npm scripts defined in the `package.json`:
```shell script
# Building
npm run build

# Running a dev server
npm run dev
```

Good luck building.
