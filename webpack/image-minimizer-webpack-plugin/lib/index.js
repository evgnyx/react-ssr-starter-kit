"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var path = _interopRequireWildcard(require("path"));

var os = _interopRequireWildcard(require("os"));

var _pLimit = _interopRequireDefault(require("p-limit"));

var _schemaUtils = require("schema-utils");

var _serializeJavascript = _interopRequireDefault(require("serialize-javascript"));

var _minify = _interopRequireDefault(require("./minify"));

var _interpolateName = _interopRequireDefault(require("./utils/interpolate-name"));

var _pluginOptions = _interopRequireDefault(require("./plugin-options.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/** @typedef {import("webpack").WebpackPluginInstance} WebpackPluginInstance */

/** @typedef {import("webpack").Compiler} Compiler */

/** @typedef {import("webpack").Compilation} Compilation */

/**
 * @callback Filter
 * @param {Buffer} source `Buffer` of source file.
 * @param {string} sourcePath Absolute path to source.
 * @returns {boolean}
 */

/**
 * @typedef {Object} PluginOptions
 * @property {Filter} [filter=() => true] Allows filtering of images for optimization.
 * @property {string|RegExp|Array<string|RegExp>} [test=/\.(jpe?g|png|gif|tif|webp|svg|avif)$/i] Test to match files against.
 * @property {string|RegExp|Array<string|RegExp>} [include] Files to include.
 * @property {string|RegExp|Array<string|RegExp>} [exclude] Files to exclude.
 * @property {boolean|string} [severityError='auto'] Allows to choose how errors are displayed.
 * @property {Object} [minimizerOptions={plugins: []}] Options for `imagemin`.
 * @property {boolean} [loader=true] Automatically adding `imagemin-loader`.
 * @property {number} [maxConcurrency=Math.max(1, os.cpus().length - 1)] Maximum number of concurrency optimization processes in one time.
 * @property {string} [filename='[path][name][ext]'] Allows to set the filename for the generated asset. Useful for converting to a `webp`.
 * @property {boolean} [deleteOriginalAssets=false] Allows to remove original assets. Useful for converting to a `webp` and remove original assets.
 */

/**
 * @extends {WebpackPluginInstance}
 */
class ImageMinimizerPlugin {
  /**
   * @param {PluginOptions} [options={}] Plugin options.
   */
  constructor(options = {}) {
    (0, _schemaUtils.validate)(_pluginOptions.default, options, {
      name: 'Image Minimizer Plugin',
      baseDataPath: 'options'
    });
    const {
      filter = () => true,
      test = /\.(jpe?g|png|gif|tif|webp|svg|avif)$/i,
      include,
      exclude,
      severityError,
      minimizerOptions = {
        plugins: []
      },
      loader = true,
      maxConcurrency,
      filename = '[path][name][ext]',
      deleteOriginalAssets = false
    } = options;
    this.options = {
      severityError,
      filter,
      exclude,
      minimizerOptions,
      include,
      loader,
      maxConcurrency,
      test,
      filename,
      deleteOriginalAssets
    };
  }
  /**
   * @private
   * @param {Compiler} compiler
   * @param {Compilation} compilation
   * @param assets
   * @param moduleAssets
   * @returns {Promise<void>}
   */


  async optimize(compiler, compilation, assets, moduleAssets) {
    // console.log('OPTIMIZE')
    // console.log(assets)

    const cache = compilation.getCache('ImageMinimizerWebpackPlugin');
    const assetsForMinify = await Promise.all(Object.keys(assets).filter(name => {
      const {
        info,
        source
      } = compilation.getAsset(name); // Skip double minimize assets from child compilation

      if (info.minimized) {
        return false;
      }

      if (!compiler.webpack.ModuleFilenameHelpers.matchObject.bind( // eslint-disable-next-line no-undefined
      undefined, this.options)(name)) {
        return false;
      } // Exclude already optimized assets from `image-minimizer-webpack-loader`


      if (this.options.loader && moduleAssets.has(name)) {
        return false;
      }

      const input = source.source();

      if (this.options.filter && !this.options.filter(input, name)) {
        return false;
      }

      return true;
    }).map(async name => {
      const {
        info,
        source
      } = compilation.getAsset(name);
      const cacheName = (0, _serializeJavascript.default)({
        name,
        minimizerOptions: this.options.minimizerOptions
      });
      const eTag = cache.getLazyHashedEtag(source);
      const cacheItem = cache.getItemCache(cacheName, eTag);
      const output = await cacheItem.getPromise();
      return {
        name,
        info,
        inputSource: source,
        output,
        cacheItem
      };
    }));

    // console.log('assetsForMinify:', assetsForMinify)

    const cpus = os.cpus() || {
      length: 1
    };
    const limit = (0, _pLimit.default)(this.options.maxConcurrency || Math.max(1, cpus.length - 1));
    const {
      RawSource
    } = compiler.webpack.sources;
    const scheduledTasks = [];

    for (const asset of assetsForMinify) {
      scheduledTasks.push(limit(async () => {
        const {
          name,
          inputSource,
          cacheItem,
          info
        } = asset;
        let {
          output
        } = asset;
        let input;
        const sourceFromInputSource = inputSource.source();

        if (!output) {
          input = sourceFromInputSource;

          if (!Buffer.isBuffer(input)) {
            input = Buffer.from(input);
          }

          const {
            severityError,
            isProductionMode,
            minimizerOptions
          } = this.options;
          const minifyOptions = {
            filename: name,
            input,
            severityError,
            isProductionMode,
            minimizerOptions
          };
          output = await (0, _minify.default)(minifyOptions);

          if (output.errors.length > 0) {
            output.errors.forEach(error => {
              compilation.errors.push(error);
            });
            return;
          }

          output.source = new RawSource(output.output);
          await cacheItem.storePromise({
            source: output.source,
            warnings: output.warnings
          });
        }

        const {
          source,
          warnings
        } = output;

        if (warnings && warnings.length > 0) {
          warnings.forEach(warning => {
            compilation.warnings.push(warning);
          });
        }

        const newName = (0, _interpolateName.default)(name, this.options.filename);
        const isNewAsset = name !== newName;

        if (isNewAsset) {
          const newInfo = {
            related: {
              minimized: newName,
              ...info.related
            },
            minimized: true
          };
          compilation.emitAsset(newName, source, newInfo);

          if (this.options.deleteOriginalAssets) {
            compilation.deleteAsset(name);
          }
        } else {
          const updatedAssetsInfo = {
            minimized: true
          };
          compilation.updateAsset(name, source, updatedAssetsInfo);
        }
      }));
    }

    // console.log('\n')

    await Promise.all(scheduledTasks);
  }
  /**
   * @param {import("webpack").Compiler} compiler
   */


  apply(compiler) {
    // console.log('\nAPPLY')

    this.options.isProductionMode = compiler.options.mode === 'production' || !compiler.options.mode;
    const pluginName = this.constructor.name;
    const moduleAssets = new Set();

    if (this.options.loader) {
      // Collect assets from modules
      // compiler.hooks.compilation.tap({
      //   name: pluginName
      // }, compilation => {
      //   compilation.hooks.moduleAsset.tap({
      //     name: pluginName
      //   }, (module, file) => {
      //     moduleAssets.add(file);
      //   });
      // });
      // compiler.hooks.afterPlugins.tap({
      //   name: pluginName
      // }, () => {
      //   const {
      //     filename,
      //     deleteOriginalAssets,
      //     filter,
      //     test,
      //     include,
      //     exclude,
      //     severityError,
      //     minimizerOptions
      //   } = this.options;
      //   const loader = {
      //     test,
      //     include,
      //     exclude,
      //     enforce: 'pre',
      //     loader: path.join(__dirname, 'loader.js'),
      //     options: {
      //       filename,
      //       deleteOriginalAssets,
      //       severityError,
      //       filter,
      //       minimizerOptions
      //     }
      //   };
      //   compiler.options.module.rules.push(loader);
      // });
    }

    compiler.hooks.compilation.tap(pluginName, compilation => {
      compilation.hooks.processAssets.tapPromise({
        name: pluginName,
        stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
        additionalAssets: true
      }, assets => this.optimize(compiler, compilation, assets, moduleAssets));
    });
  }

}

ImageMinimizerPlugin.loader = require.resolve('./loader');
ImageMinimizerPlugin.normalizeConfig = require('./utils/normalize-config').default;
var _default = ImageMinimizerPlugin;
exports.default = _default;