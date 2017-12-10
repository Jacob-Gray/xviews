var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    watch = require('gulp-watch'),
    uglify = require('gulp-uglify');

function compile() {

    console.log("Compiling JS files...");

    // Generate full unzipped file
    var fullLibrary = gulp.src("./js/**.js");

    fullLibrary.pipe(concat('xview.full.js'))
        .pipe(gulp.dest('./lib'))
        .pipe(rename('xview.full.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./lib'))

    // Generate unzipped engine-only file
    var fullEngine = gulp.src(['./js/XElement.js', './js/XView.js']);

    fullEngine.pipe(concat('xview.engine.js'))
        .pipe(gulp.dest('./lib'))
        .pipe(rename('xview.engine.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./lib'));
}

gulp.task('default', function () {

    compile();

    return watch('./js/*.js', compile);
});