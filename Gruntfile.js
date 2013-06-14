/* global module:false */
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    watch: {
      coffee: {
          files: ['src/*.coffee'],
          tasks: ['coffee', 'uglify']
        }
    },
    coffee: {
      options: {
        join: true
      },
      compile: {
        files: {
          'js/drawingApp.js': ['src/*.coffee']
        }
      }
    },
    uglify: {
        my_target: {
          options: {
            mangle: false
          },
          files: {
            'js/drawingApp.min.js': ['js/drawingApp.js']
          }
        }
      }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-coffee');

  // Default task.
  grunt.registerTask('default', ['coffee', 'uglify']);
};
