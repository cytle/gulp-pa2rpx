'use strict';

const PluginError = require('plugin-error');
const through = require('through2');
const extend = require('extend');

const PLUGIN_NAME = 'gulp-px2rpx';

let defaultConfig = {
    unit: 'rpx', // 单位
    replaceUnit: 'px', // 被替换的
    screenWidth: 750, // 设计稿屏幕
    wxappScreenWidth: 750, // 微信小程序屏幕
    remPrecision: 6 // 小数精度, 默认6
};
function gulpPx2Rpx (options) {
    options = extend({}, defaultConfig, options);
    var reg = new RegExp('([\\d.]*\\d)' + options.replaceUnit, 'g');
    var ratio = options.wxappScreenWidth / options.screenWidth;
    var remPrecision = options.remPrecision;
    function getValue(val) {
      val = parseFloat(val.toFixed(remPrecision)); // control decimal precision of the calculated value
      return val == 0 ? val : val + options.unit;
    }
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return cb();
        }

        try {
            file.contents = new Buffer(file.contents.toString().replace(reg, function (m, p1) {
                return getValue(p1 * ratio);
            }));
        } catch (err) {
            this.emit('error', new PluginError(PLUGIN_NAME, err));
        }

        this.push(file);

        return cb();
    });
}

module.exports = gulpPx2Rpx;
