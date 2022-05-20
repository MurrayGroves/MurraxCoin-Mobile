module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ["@babel/plugin-syntax-bigint", ['babel-plugin-rewrite-require', {aliases: {"stream": "stream-browserify"}}]]
  };
};