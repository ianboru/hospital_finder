const LiveReloadPlugin = require('webpack-livereload-plugin')
const WebpackGlobEntriesPlugin = require('webpack-glob-entries-plugin')

const watcher = new WebpackGlobEntriesPlugin([
  './static/*.js',
  './static/css/*.css'
])

module.exports = {
  entry: watcher.entries(),
  output: {
    path: __dirname + '/dist'
  },
  stats: 'minimal',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader'
          }
        ]
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: 'react-svg-loader',
            options: {
              jsx: true
            }
          }
        ]
      }
    ]
  },
  plugins: [new LiveReloadPlugin()]
}
