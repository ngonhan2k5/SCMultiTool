const express = require('express')
const app = express()
const port = 3001

var start = function(send){
	const route = require('./route')

	app.use('/',express.static('public'))

	app.get('/reg', (req, res) => {

		var params = req.url.split('?').pop().split('&')
		var query = {token:params[0], tz:params[1]}

		console.log(query.token)
		console.log(req.headers.referer)
		if (query.token){
			route.registerTz(query, send).then(
				(ret) => {
					res.send(`${ret.user}: Thank you for registered!`)
				},
				(err) => {
					res.send("Token expired. Please use <b>reg</b> command again from discord")
				},
			).finally(
				() => {
					if(!res.headersSent)
						res.send('Nothing')
				}
			)
			// tokens.findOne({token:req.query.id}, (err,doc) => {
			// 	if (doc)
			// 		res.send(doc)
			// 	else
			// 		res.send('NG')
			// })
		}else{
			res.send('Sorry!Nothing happed')
		}
	})

	app.get('/thook', (req, res) => {

		route.log('Hook called', {query:req.query, header:req.headers}, send)
		// route.log('Hook called', req, send)
		res.send(req.url.split('?').pop().split('&'))
		//res.send(Object.keys(req.query).map(function(i){return i}))

	})

	app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}

module.exports = {
	start:start
}
