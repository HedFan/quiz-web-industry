'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    rigger = require('gulp-rigger'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    gcmq = require('gulp-group-css-media-queries'),
    cleanCSS = require('gulp-clean-css'),
    imagemin = require('gulp-imagemin'),
    plumber = require('gulp-plumber'),
    concat = require('gulp-concat'),
    cru = require('gulp-css-rework-url'),
    imageminPngquant = require('imagemin-pngquant'),
    imageminJpegRecompress = require('imagemin-jpeg-recompress'),
    modifyCssUrls = require('gulp-modify-css-urls'),
    path = require('path'),
    filter = require('gulp-filter'),
    flatten = require('gulp-flatten'),
    mainBowerFiles = require('main-bower-files'),
    rename = require("gulp-rename"),
    browserSync = require("browser-sync");


var custom_path = {
    src: {
        style: 'css/src/style.scss',
        js: 'js/src/scripts.js',
        img: 'images_prebuild/**/*.*',
        font: 'css/fonts/**/*.css'
    },
    build: {
        js: 'js/',
        style: 'css/',
        img: 'images/',
        font: 'css/'
    },
    watch: {
        style: 'css/src/**/*.scss',
        js: 'js/src/**/*.js',
    },
    root: {
        src: '/'
    }
};

gulp.task('style:build', function () {
    gulp.src(custom_path.src.style)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(gcmq())
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(custom_path.build.style));
});

gulp.task('font:build', function () {
    gulp.src(custom_path.src.font)
        .pipe(cleanCSS({
            rebaseTo: '.',
        }))
        .pipe(modifyCssUrls({
            modify: function (url, filePath) {
                return url;
            },
            prepend: '/',
        }))
        .pipe(concat('fonts.min.css'))
        .pipe(gulp.dest(custom_path.build.font));
});

gulp.task('js:build', function () {
    gulp.src(custom_path.src.js) //Найдем наш main файл
        .pipe(plumber())
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest(custom_path.build.js)) //Выплюнем готовый файл в build
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(sourcemaps.write('.')) //Пропишем карты
        .pipe(gulp.dest(custom_path.build.js)); //Выплюнем готовый файл в build
});

gulp.task('image:build', function () {
    return gulp.src(custom_path.src.img) //Выберем наши картинки
        .pipe(gulp.dest(custom_path.build.img)) //Копируем изображения заранее, imagemin может пропустить парочку )
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imageminJpegRecompress({
                progressive: true,
                max: 80,
                min: 70
            }),
            imageminPngquant({quality: '80'}),
            imagemin.svgo({
                plugins: [{removeViewBox: true}, {removeXMLProcInst: true}, {removeTitle: true}, {removeDesc: true}, {removeUselessDefs: true}, {convertTransform: true}, {collapseGroups: true}, {cleanupIDs: true}, {removeUnusedNS: true}]
            })
        ]))
        .pipe(gulp.dest(custom_path.build.img)); //И бросим в prod оптимизированные изображения
});

gulp.task('browser-sync', gulp.series(function (done) {
    var files = [
        '**/*.html',
        'css/**/*.scss',
        'js/**/*.js'
    ];

    browserSync.init(files, {
        server: {
            baseDir: "./"
        },
        tunnel: false,
        host: 'localhost',
        port: 7777,
        open: true,
    });
    done();
}));

gulp.task('style:build', gulp.series(function (done) {
    gulp.src(custom_path.src.style)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(gcmq())
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(custom_path.build.style));
    done();
}));


gulp.task('watch', gulp.series(function (done) {
    gulp.watch([custom_path.watch.style], gulp.series('style:build'));
    done();
}));

gulp.task('default', gulp.series(['browser-sync','watch']));