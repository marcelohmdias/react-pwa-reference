/***
 * Copyright (c) 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/*eslint no-console:0 */
import fs from 'fs';
import swPrecache from 'sw-precache';
import cannibalizr from 'cannibalizr';

/**
 * Runs the sw-precache task to generate precached sw assets.
 *
 * @param {Object} settings - The project settings.
 * @param {Boolean} prod - True if production, false otherwise.
 * @param {Boolean} debug - True to include debugging information, false othrw.
 * @param {Object} pkg - The package json.
 * @param {Function} done - The done callback.
 */
function runSwPrecache (settings, prod, debug, pkg, done) {
  const options = {
    logger: console.log,
    debug: debug,
    verbose: true,
    cacheId: pkg.name,
    handleFetch: prod,
    directoryIndex: false,
    stripPrefix: settings.dist.baseDir,
    replacePrefix: settings.web.baseDir,
    staticFileGlobs: [
      `${settings.dist.fonts}/**.*`,
      // in this project, photos are only served via image service
      `${settings.dist.images}/**.!(jpg|jpeg)`,
      // precache all scripts except those that are inlined
      `${settings.dist.scripts}/!(header|inline).*`,
      // precache all styles except those that are inlined
      `${settings.dist.styles}/!(index|inline).*`
    ]
  };

  if (prod) {
    options.staticFileGlobs.push(
      // this means webpack main bundle has already built (or has to be).
      settings.web.assets.mainScript()
    )
  }

  swPrecache.write(settings.src.serviceWorker.precache, options, done);
}

/**
 * Factory for the serviceWorker task.
 * Prepares for service worker bundling by generating code.
 *
 * @param {Object} settings - The project settings.
 * @param {Boolean} prod - True for production, false otherwise.
 * @param {Boolean} debug - True to include debuggin info, false otherwise.
 * @returns {Function} The serviceWorker task.
 */
export default function serviceWorkerTaskFactory (settings, prod, debug) {
  const pkgJson = 'package.json';

  return function serviceWorker (done) {
    fs.readFile(pkgJson, {
      encoding: 'utf8'
    }, (err, data) => {
      if (err) {
        return done(new Error(`Task failed to read ${pkgJson}: ${err}`));
      }

      const pkg = JSON.parse(data);

      cannibalizr({
        output: {
          file: settings.src.serviceWorker.data,
          manifest: {
            cacheId: pkg.name,
            version: pkg.version,
            debug: debug
          }
        },
        input: {
          assets: [{
            file: `${settings.src.styles}/_fonts.scss`,
            captures: [{
              global: true,
              matchIndex: 1,
              re: /url\(([^\)]+)\)/ig
            }]
          }]
        },
        logger: console.log
      });

      runSwPrecache(settings, prod, debug, pkg, done);
    });
  };
}
