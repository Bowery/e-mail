var assert = require('assert')
var Email = require('../lib/e-mail')
var email = new Email()

suite('bowery.email', function () {
  describe('EmailClient#to', function () {
    it('should require a recipient', function () {
      assert.throws(email.to())
    })

    it('should require a valid address', function () {
      assert.throws(email.to('sjkaliski'))
    })

    it('should accept a string value and set as array', function () {
      assert.deepEqual(email.to('sjkaliski@gmail.com')._to, ['sjkaliski@gmail.com'])
    })
  })

  describe('EmailClient#from', function () {
    it('should require a sender', function () {
      assert.throws(email.from())
    })
  })

  describe('EmailClient#subject', function () {
    it('should require a subject line', function () {
      assert.throws(email.subject())
    })
  })
})
