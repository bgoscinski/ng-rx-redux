SystemJS.config({
  transpiler: "plugin-typescript",
  packages: {
    "ng-rx-redux": {
      "format": "esm",
      "main": "ng-rx-redux.js",
      "meta": {
        "*.js": {
          "loader": "plugin-typescript"
        }
      }
    }
  }
});

SystemJS.config({
  packageConfigPaths: [
    "github:*/*.json",
    "npm:@*/*.json",
    "npm:*.json"
  ],
  map: {
    "angular": "github:angular/bower-angular@1.5.2",
    "core-js": "npm:core-js@1.2.6",
    "fs": "github:jspm/nodelibs-fs@0.2.0-alpha",
    "path": "github:jspm/nodelibs-path@0.2.0-alpha",
    "plugin-typescript": "github:frankwallis/plugin-typescript@4.0.2",
    "process": "github:jspm/nodelibs-process@0.2.0-alpha",
    "rxjs": "npm:rxjs@5.0.0-beta.2"
  },
  packages: {
    "github:frankwallis/plugin-typescript@4.0.2": {
      "map": {
        "typescript": "npm:typescript@1.8.9"
      }
    }
  }
});
