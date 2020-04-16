const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PrettierPlugin = require("prettier-webpack-plugin");

module.exports = {
  entry: {
    vendor: './src/assets/scripts/vendor.js',
    app: './src/assets/scripts/app.js',
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'assets/scripts/[name].js',
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'eslint-loader',
        options: {
          failOnWarning: false,
          failOnError: true,
          fix: true,
        }
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
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
        test: /\.(html)$/i,
        use: [
          {
            loader: 'html-loader',
          }
        ]
      },
      {
        test: /\.(ejs)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'views',
            }
          }
        ]
      },
      {
        test: /\.(pdf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
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
              name: '[name].[ext]',
              outputPath: 'assets/images',
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
              name: '[name].[ext]',
              outputPath: 'assets/fonts',
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "assets/styles/[name].css",
    }),
    new HtmlWebpackPlugin({
      title: 'Pontuador OBR',
      template: 'src/views/index.html',
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
    }),
    new PrettierPlugin({
      tabWidth: 2, // Specify the number of spaces per indentation-level.
      useTabs: false, // Indent lines with tabs instead of spaces.
      semi: true, // Print semicolons at the ends of statements.
      encoding: 'utf-8', // Which encoding scheme to use on files
      extensions: [".js"],
      singleQuote: true,
      arrowParens: "avoid",
      endOfLine: "auto" 
    }),
  ],
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  resolve: {
    extensions: ['.js', '.scss', '.css', '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.html', '.ejs']
  }
};
