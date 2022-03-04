module.exports.getConfig = (params) => ({
  isDev: process.env.NODE_ENV === 'development',
  isServer: params ? params.isServer : false,
  isModules: true,
})

module.exports.merge = function merge(config, data) {
  for (const key in data) {
    if (key in config) {
      if (Array.isArray(config[key])) {
        config[key] = [...config[key], ...data[key]]
      }
      else if (typeof config[key] === 'object') {
        config[key] = merge(config[key], data[key])
      }
    }
    else {
      config[key] = data[key]
    }
  }
  return config
}

module.exports.getEnvs = () => {
  const envs = {}
  if (_CONFIG_.env) {
    for (const envName in _CONFIG_.env) {
      envs[`process.env.${ envName }`] = `'${ _CONFIG_.env[envName] }'`
    }
  }
  return envs
}
