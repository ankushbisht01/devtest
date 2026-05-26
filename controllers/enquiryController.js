var Enquiry = require('../models/enquiry')
var Product = require('../models/product')
var mailer = require('../utils/dummyMailer')

// Display list of all Enquirys.
exports.enquiry_list = async function(req, res) {
	try {
		var list_all = await Enquiry.find({}, '_id comment status', {
			sort: { date: -1 }
		})
		res.render('dashboard', { enquiries: list_all })
	} catch (err) {
		res.render('dashboard', { enquiries: [] })
	}
}

// Display list of all Enquirys.
exports.dashboard_list = async function(req, res) {
	try {
		var list_unread = await Enquiry.find(
			{ status: true },
			'_id comment status',
			{ sort: { date: -1 } }
		)
		res.render('dashboard', { enquiries: list_unread })
	} catch (err) {
		res.render('dashboard', { enquiries: [] })
	}
}

// Display detail page for a specific Enquiry.
exports.enquiry_detail = async function(req, res) {
	try {
		var enquiry = await Enquiry.findById(req.params.id)
		if (!enquiry) {
			return res.status(404).send({ error: 'Enquiry not found' })
		}
		res.send(enquiry)
		enquiry.status = false
		try {
			await Enquiry.findByIdAndUpdate(req.params.id, enquiry, {})
		} catch (_) {
			// non-fatal: response already sent
		}
	} catch (err) {
		res.status(500).send(err)
	}
}

// Handle Enquiry create on POST.
exports.enquiry_create_post = async function(req, res) {
	try {
		var pro = await Product.findById(req.body.productid)

		var enquiry = new Enquiry({
			name: req.body.name,
			comment: req.body.comment,
			email: req.body.email,
			phone: req.body.phone
		})

		if (enquiry.comment == 'nothing' && pro) {
			enquiry.comment = 'About: ' + pro.name
		}

		let email = {
			to: 'sparc.ideas@gmail.com',
			from: `SpArc Enquiry <sparc@root-kings.com>`,
			subject: `Enquiry: ${enquiry.comment} `,
			html: `<p>Body: ${enquiry.comment}. \
                        <br> \
                        <br>From: ${enquiry.name}  \
                        <br>Email: ${enquiry.email} \
                        <br>Phone: ${enquiry.phone} </p>`
		}

		mailer.send(email)

		await enquiry.save()
		res.send(pro || enquiry)
	} catch (err) {
		res.status(500).send(err)
	}
}

// Handle Enquiry create on POST.
exports.enquiry_contact_create_post = async function(req, res) {
	var enquiry = new Enquiry({
		name: req.body.name,
		comment: req.body.comment,
		email: req.body.email,
		phone: req.body.phone
	})

	let email = {
		to: 'sparc.ideas@gmail.com',
		from: `SpArc Enquiry <sparc@root-kings.com>`,
		subject: `Enquiry: ${enquiry.comment} `,
		html: `<p>Body: ${enquiry.comment}. \
                    <br> \
                    <br>From: ${enquiry.name}  \
                    <br>Email: ${enquiry.email} \
                    <br>Phone: ${enquiry.phone} </p>`
	}

	mailer.send(email)

	try {
		await enquiry.save()
		res.render('contact', { status: true })
	} catch (err) {
		res.status(500).send(err)
	}
}

// Display Enquiry delete form on GET.
exports.enquiry_delete_get = async function(req, res) {
	try {
		await Enquiry.findByIdAndDelete(req.params.id)
		res.send(true)
	} catch (err) {
		res.status(500).send(err)
	}
}
