/***
 * Copyright (c) 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
import gulp from 'gulp';

/**
 * Factory for the copy task.
 *
 * @param {Object} settings - The project settings.
 * @returns {Function} the copy task.
 */
export default function copyTaskFactory (settings) {
  return function copy () {
    return gulp.src([
      '**',
      // Copy all assets, EXCEPT:

      // styles are processed by ccss
      '!**/styles/**',
      // svg is processed by svg task
      '!images/*.svg',
      // scripts are processed by webpack
      '!scripts/**'
    ], {
      cwd: settings.src.assets
    })
    .pipe(gulp.dest(settings.dist.baseDir));
  }
}
