# Email by Bowery

Email by Bowery is a really easy to use layer around popular mail services.

## Installation

```
$ npm install e-mail
```

## Usage

```javascript
var email = require('e-mail')({
  service: 'amazonses',
  access_key: '',
  secret_key: ''
})

email.send
  .to('steve@bowery.io')
  .from('byrd@bowery.io')
  .cc(['support@bowery.io', 'team@bowery.io'])
  .subject('Super important email')
  .body('/path/to/template.hjs', '/path/to/style.css', {name: 'Customer'})

```

### Templates

Email by Bowery currently supports [Hogan.js](http://twitter.github.io/hogan.js/) for templating and CSS for styling.

### Mail Services

At the moment Amazon's [SES](http://aws.amazon.com/ses/) is the only supported service.
