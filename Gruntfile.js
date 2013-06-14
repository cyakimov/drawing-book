/* global module:false */
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    watch: {
      coffee: {
          files: ['src/*.coffee'],
          tasks: ['concat','coffee']//,'uglify'
        }
    },
    coffee: {
      // options: {
      //   bare: true
      // },
      compile: {
        files: {
          'js/drawingApp.js': ['src/concatenated.coffee']
        }
      }
    },
    concat: {
      dist: {
        src: ['src/*.coffee'],
        dest: 'src/concatenated.coffee'
      }
    },
    uglify: {
        my_target: {
          options: {
            sourceMap: 'js/drawingApp.js',
            mangle: false
          },
          files: {
            'js/drawingApp.min.js': ['js/drawingApp.js']
          }
        }
      }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-coffee');

  // Default task.
  grunt.registerTask('default', 'coffee');
};