// Copyright 2013 Bowery Software, LLC.
/**
 * @fileoverview bowery.email client.
 */


// Module dependencies.
var fs = require('fs')
var Q = require('kew')
var hjs = require('hjs')
var juice = require('juice')
var check = require('validator').check


/**
 * @constructor
 */
function Email (delegate) {
  this.delegate = delegate

  /**
   * Charset for Email.
   * @type {string}
   */
  this.charset = 'utf-8'

  /**
   * Recipients.
   * @type {Array<string>}
   * @protected
   */
  this._to = []

  /**
   * Sender.
   * @type {string}
   * @protected
   */
  this._from = null

  /**
   * Subject line.
   * @type {string}
   * @protected
   */
  this._subject = null

  /**
   * Carbon copy recipients.
   * @type {Array<string>}
   * @protected
   */
  this._cc = []

  /**
   * Blind carbon copy recipients.
   * @type {Array<string>}
   * @protected
   */
  this._bcc = []
}


/**
 * Set recipients.
 * @param {string|Array<string>} addresses
 * @return {Email}
 */
Email.prototype.to = function (addresses) {
  if (!addresses) return Error('Recipient(s) required.')
  if (!(addresses instanceof Array)) { addresses = [addresses] }

  this._validateAddresses(addresses)

  this._to = addresses
  return this
}


/**
 * Set senders.
 * @param {string} address
 * @return {Email}
 */
Email.prototype.from = function (address) {
  if (!address) return Error('Sender required.')
  
  this._validateAddresses(address)

  this._from = address
  return this
}


/**
 * Set subject line.
 * @param {string} content Subject line.
 * @return {Email}
 */
Email.prototype.subject = function (content) {
  if (!content) return Error('Subject line required.')
  
  this._subject = content + ''
  return this
}


/**
 * Set carbon copy recipients.
 * @param {string|Array<string>} addresses
 * @return {Email}
 */
Email.prototype.cc = function (addresses) {
  if (!(addresses instanceof Array)) { addresses = [addresses] }

  this._validateAddresses(addresses)

  this._cc = addresses
  return this
}


/**
 * Set blind carbon copy recipients.
 * @param {string|Array<string>} addresses
 * @return {Email}
 */
Email.prototype.bcc = function (addresses) {
  if (!(addresses instanceof Array)) { addresses = [addresses] }

  this._validateAddresses(addresses)

  this._bcc = addresses
  return this
}


/**
 * Set template and associated styling and context.
 * @param {String} template Path to email template.
 * @param {String} styles Path to style file.
 * @param {Object} context
 */
Email.prototype.body = function (template, styles, context) {
  this._template = template
  this._styles = styles
  this._context = context || {}

  var handle = this._onError.bind(this)
  this._compile().fail(handle)
  .then(this['_send' + this.delegate.config.service].bind(this)).fail(handle)
}


/**
 * Compile templates, styles, and context.
 * @return {Promise}
 * @protected
 */
Email.prototype._compile = function () {
  var defer = Q.defer()
  var self = this
  fs.readFile(this._template, this.charset, function (err, data) {
    if (err) return defer.reject(err)
    
    var template = hjs.compile(data)
    self._compiled = template.render(self._context)

    if (!self._styles) return defer.resolve()

    fs.readFile(self._styles, self.charset, function (err, data) {
      if (err) return defer.reject(err)

      self._compiled = juice.inlineContent(self._compiled, data)
      defer.resolve()
    })
  })
  return defer.promise
}


/**
 * Send email via Amazon SES.
 * @return {Promise}
 * @protected
 */
Email.prototype._sendAmazonSES = function () {
  var defer = Q.defer()
  var payload = {
    Source: this._from,
    Destination: {
      ToAddresses: this._to,
      CcAddresses: this._cc,
      BccAddresses: this._bcc
    },
    Message: {
      Subject: {
        Data: this._subject,
        Charset: this.charset
      },
      Body: {
        Html: {
          Data: this._compiled,
          Charset: this.charset
        }
      }
    }
  }

  this.delegate.mailClient.sendEmail(payload, defer.makeNodeResolver())
  return defer.promise
}


/**
 * Validate email address(es).
 * @param {String|Array<String>} addresses
 * @protected
 */
Email.prototype._validateAddresses = function (addresses) {
  if (!(addresses instanceof Array)) { addresses = [addresses] }
  addresses.forEach(function (address) {
    try {
      check(address).len(6, 64).isEmail() 
    } catch (e) {
      return Error(address + ' is an invalid address.')
    }
  })
}


/**
 * Error handling.
 * @param {Error} err The Error.
 * @protected
 */
Email.prototype._onError = function (err) {
  console.log('Error: ', err)
  if (err) {
    throw err
  }
}

module.exports = Email
