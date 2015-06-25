"use strict";
var lrSnippet, mountFolder;

mountFolder = function(connect, dir) {
	return connect["static"](require("path").resolve(dir));
};

module.exports = function(grunt) {
	require("load-grunt-tasks")(grunt);
	require("time-grunt")(grunt);

	// var wisepix = {
	// 	htmlFiles: [
	// 		'<%= yeoman.app %>/'+'*.html']
	// }

	// var yeomanConfig = {
	// 	app: "client",
	// 	dist: "public"
	// };

	var bowerConfig = {
		directory: './bower_components'
	};

	// try {
	// 	yeomanConfig.app = require("./bower.json").appPath || yeomanConfig.app;
	// } catch (_error) {}
	
	grunt.initConfig({
		// yeoman: yeomanConfig,
		// Instal bower dependencies
		// bower: {
		// 	install: {
		// 		options: {
		// 			targetDir: bowerConfig.directory,
  //       			cleanTargetDir: true,
  //       			copy: false,
  //       			verbose: true,
  //       		}
		// 	}
		// },

		
		// clean: {
		// 	dist: {
		// 		files: [
		// 		{
		// 			dot: true,
		// 			src: [".tmp", "<%= yeoman.dist %>/*", "!<%= yeoman.dist %>/.git*"]
		// 		}
		// 		]
		// 	}
		// },
		
		compass: {
			options: {
				sassDir: "sass",
				cssDir: "styles",
				// generatedImagesDir: ".tmp/styles/ui/images/",
				// imagesDir: "<%= yeoman.app %>/styles/ui/images/",
				// javascriptsDir: "<%= yeoman.app %>/scripts",
				// fontsDir: "<%= yeoman.app %>/fonts",
				// importPath: "<%= yeoman.app %>/bower_components",
				// httpImagesPath: "styles/ui/images/",
				// httpGeneratedImagesPath: "styles/ui/images/",
				// httpFontsPath: "fonts",
				relativeAssets: true
			},
			dist: {
				options: {
					debugInfo: false,
					noLineComments: true
				}
			},
			server: {
				options: {
					debugInfo: false,
					noLineComments: true
				}
			},
			forvalidation: {
				options: {
					debugInfo: false,
					noLineComments: false
				}
			}
		},
		
		// coffee: {
		// 	server: {
		// 		options: {
		// 			sourceMap: true,
		// 			sourceRoot: ""
		// 		},
		// 		files: [
		// 		{
		// 			expand: true,
		// 			cwd: "<%= yeoman.app %>/scripts",
		// 			src: "**/*.coffee",
		// 			dest: ".tmp/scripts",
		// 			ext: ".js"
		// 		}
		// 		]
		// 	},
		// 	dist: {
		// 		options: {
		// 			sourceMap: false,
		// 			sourceRoot: ""
		// 		},
		// 		files: [
		// 		{
		// 			expand: true,
		// 			cwd: "<%= yeoman.app %>/scripts",
		// 			src: "**/*.coffee",
		// 			dest: ".tmp/scripts",
		// 			ext: ".js"
		// 		}
		// 		]
		// 	}
		// },
		
		// useminPrepare: {
		// 	html: wisepix.htmlFiles,
		// 	options: {
		// 		dest: "<%= yeoman.dist %>",
		// 		flow: {
		// 			steps: {
		// 				js: ["concat"],
		// 				css: ["concat"]
		// 			},
		// 			post: []
		// 		}
		// 	}
		// },
		
		
		// jshint: {
		// 	options: {
		// 		jshintrc: ".jshintrc"
		// 	},
		// 	all: ["Gruntfile.js", "<%= yeoman.app %>/scripts/**/*.js"]
		// },
		
		// concurrent: {
		// 	assets: ['copy:scripts', "copy:styles", "htmlmin"],
		// 	dev: ['copy:scripts', "compass:server", "copy:styles"],
		// 	dist: ['concurrent:assets', "compass:dist"],
		// },

		// htmlmin: {
		// 	dist: {
		// 		options: {},
		// 		files: [
		// 		{
		// 			expand: true,
		// 			cwd: "<%= yeoman.app %>",
		// 			src: ["*.html", "views/*.html", 'admin/*.html'],
		// 			dest: "<%= yeoman.dist %>"
		// 		}
		// 		]
		// 	}
		// },
		
		// copy: {
		// 	dist: {
		// 		files: [
		// 		{
		// 			expand: true,
		// 			dot: true,
		// 			cwd: "<%= yeoman.app %>",
		// 			dest: "<%= yeoman.dist %>",
		// 			src: ["favicon.ico", "bower_components/font-awesome/css/*", "bower_components/font-awesome/fonts/*", "bower_components/weather-icons/css/*", "bower_components/weather-icons/font/*", "fonts/**/*", "i18n/**/*", "images/**/*", "styles/bootstrap/**/*", "styles/fonts/**/*", "styles/img/**/*", "styles/ui/images/**/*", "views/**/*"]
		// 		}, {
		// 			expand: true,
		// 			cwd: ".tmp",
		// 			dest: "<%= yeoman.dist %>",
		// 			src: ["styles/**", "assets/**"]
		// 		}, {
		// 			expand: true,
		// 			cwd: ".tmp/images",
		// 			dest: "<%= yeoman.dist %>/images",
		// 			src: ["generated/*"]
		// 		}
		// 		]
		// 	},

		// 	scripts: {
		// 		expand: true,
		// 		cwd: "<%= yeoman.app %>/scripts",
		// 		dest: '.tmp/scripts',
		// 		src: ["**/*.js"],
		// 	},

		// 	dev: {
		// 		expand: true,
		// 		cwd: "<%= yeoman.app %>",
		// 		dest: '<%= yeoman.dist %>',
		// 		src: ['bower_components/**/*.js', 'scripts/**/*.js'],
		// 	},

		// 	styles: {
		// 		expand: true,
		// 		cwd: "<%= yeoman.app %>/styles",
		// 		dest: ".tmp/styles/",
		// 		src: "**/*.css"
		// 	}
		// },
		
		// concat: {
		// 	options: {
		// 		separator: grunt.util.linefeed + ';' + grunt.util.linefeed
		// 	},
		// 	dist: {
		// 		src: ["<%= yeoman.dist %>/bower_components/angular/angular.min.js"],
		// 		dest: "<%= yeoman.dist %>/scripts/vendor.js"
		// 	}
		// },
		
		// uglify: {
		// 	options: {
		// 		mangle: false
		// 	},
		// 	dist: {
		// 		files: {
		// 			"<%= yeoman.dist %>/scripts/app.js": [".tmp/**/*.js", "<%= yeoman.app %>/scripts/**/*.js"]
		// 		}
		// 	}
		// },

		// usemin: {
		// 	html: ["<%= yeoman.dist %>/**/*.html", "!<%= yeoman.dist %>/bower_components/**"],
		// 	css: ["<%= yeoman.dist %>/styles/**/*.css"],
		// 	options: {
		// 		dirs: ["<%= yeoman.dist %>"]
		// 	}
		// },

		watch: {
			// js: {
			// 	files: ["<%= yeoman.app %>/scripts/**/*.js"],
			// 	tasks: ['buildDevFast']
			// },
			// views: {
			// 	files: ["<%= yeoman.app %>/**/*.html"],
			// 	tasks: ['buildDevFast']
			// },
			compass: {
				files: ["sass/**/*.{scss,sass}", 'views/**/*', 'scripts/**/*'],
				tasks: ['build']
			}
		},
	});

	grunt.registerTask("start", [
		"compass:server",
		"watch:compass"
	]);

	grunt.registerTask('build', [
		'compass:server',
	]);

	grunt.registerTask("default", ["build"]);
};