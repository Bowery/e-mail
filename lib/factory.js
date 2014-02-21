var Email = require('./e-mail')
var AWS = require('aws-sdk')

/**
 * @param {Object} config
 * @constructor
 */
function Factory (config) {
  /**
   * Service configuration
   * @type {Object}
   */
  this.config = config

  // Validate provided configuration
  this.validateConfig()
  
  /**
   * Mail client.
   * @param {Object}
   */
  this.mailClient
}


/**
 * Email services
 * @enum {string}
 */
Factory.Service = {
  AMAZONSES: 'AmazonSES'
}

/**
 * Factory getter's & setters
 */
Factory.prototype = {
  /**
   * Create new email.
   * @return {Email}
   */
  get send() {
    return new Email(this)
  }
}

/**
 * Validate configuration.
 */
Factory.prototype.validateConfig = function () {
  var config = this.config
  if (!config)
    throw new Error('Configuration required.')

  switch (config.service) {
    case Factory.Service.AMAZONSES:
      if (!config.access_key || !config.secret_key) {
        throw new Error('AccessKey and SecretKey required for ' + Factor.Service.AMAZONSES)
      } else {
        AWS.config.update({
          accessKeyId: config.access_key,
          secretAccessKey: config.secret_key
        })
        this.mailClient = new AWS.SES()
        break
      }
    default:
      throw new Error(config.service + ' not supported.')
      break
  }
}

module.exports = Factory
