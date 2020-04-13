const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    vendor: './src/assets/scripts/vendor.js',
    app: './src/assets/scripts/app.js',
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          }
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader, // Extract sass/scss/css files from js files
          },
          {
            loader: "css-loader", // Resolves url() and @imports inside CSS
          },
          {
            loader: "postcss-loader", // Apply autoprefixer and minifying
          },
          {
            loader: "sass-loader", // Transform SASS/SCSS to CSS
            options: {
              implementation: require("sass"),
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [
          {
            loader: "file-loader",

            options: {
              outputPath: 'images',
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|ttf|otf|eot)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: 'fonts',
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      moduleFilename: ({ name }) => `${name.replace('/js/', '/css/')}.css`
    }),
    new HtmlWebpackPlugin({
      title: 'Pontuador OBR',
      template: 'src/views/index.ejs',
      inject: 'body',
      // favicon: 'assets/images/icon.png',
      meta:	{
	      description: '',
	      viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, shrink-to-fit=no',
	      'apple-mobile-web-app-capable': 'yes',
	      'apple-mobile-web-app-status-bar-style': 'black',
      },
      minify: {
        collapseWhitespace: false,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
      },
      scriptLoading: 'defer',
    })
  ],
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  resolve: {
    extensions: ['.js', '.scss']
  }
};
