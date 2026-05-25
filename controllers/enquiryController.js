var Enquiry = require('../models/enquiry')
var Product = require('../models/product')
var mailer = require('../utils/dummyMailer')

// Display list of all Enquirys.
exports.enquiry_list = function(req, res) {
	Enquiry.find({}, '_id comment status', {
		sort: {
			date: -1 //Sort by Date Added DESC
		}
	}).exec(function(err, list_all) {
		if (err) {
			return res.render('dashboard', {
				enquiries: []
			})
		}
		//Successful, so render
		res.render('dashboard', {
			enquiries: list_all
		})
		//res.send(list_products);
	})
	//res.send('NOT IMPLEMENTED: Enquiry list');
}

// Display list of all Enquirys.
exports.dashboard_list = function(req, res) {
	Enquiry.find(
		{
			status: true
		},
		'_id comment status',
		{
			sort: {
				date: -1 //Sort by Date Added DESC
			}
		}
	).exec(function(err, list_unread) {
		if (err) {
			return res.render('dashboard', {
				enquiries: []
			})
		}
		//Successful, so render
		res.render('dashboard', {
			enquiries: list_unread
		})
		//res.send(list_products);
	})
}

// Display detail page for a specific Enquiry.
exports.enquiry_detail = function(req, res) {
	Enquiry.findById(req.params.id).exec(function(err, enquiry) {
		if (err) {
			return res.status(500).send(err)
		}
		if (!enquiry) {
			return res.status(404).send({
				error: 'Enquiry not found'
			})
		}
		//Successful, so render
		//console.log(product)
		res.send(enquiry)
		//res.send(list_products);
		enquiry.status = false
		Enquiry.findByIdAndUpdate(req.params.id, enquiry, {}, function(err) {
			if (err) {
				return
			}
			//Successful, so render
			//console.log(product)
			//res.send(enquiry);
			//res.send(list_products);
		})
	})
	// res.send('NOT IMPLEMENTED: Enquiry detail: ' + req.params.id);
}

// Handle Enquiry create on POST.
exports.enquiry_create_post = function(req, res) {
	Product.findById(req.body.productid).exec(function(err, pro) {
		if (err) {
			return res.status(500).send(err)
		}

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
            from: `SpArc Enquiry <sparc@root-kings.com>`, //
            subject: `Enquiry: ${enquiry.comment} `,
            html: `<p>Body: ${enquiry.comment}. \
                        <br> \
                        <br>From: ${enquiry.name}  \
                        <br>Email: ${enquiry.email} \
                        <br>Phone: ${enquiry.phone} </p>`
        }

        mailer.send(email)

		enquiry.save(function(err) {
			if (err) {
				return res.status(500).send(err)
			}
			//successful - redirect to new book record.
			res.send(pro || enquiry)

			
		})

		//res.send('NOT IMPLEMENTED: Enquiry create POST');
	})
}

// Handle Enquiry create on POST.
exports.enquiry_contact_create_post = function(req, res) {
	//console.log(req.body);

	var enquiry = new Enquiry({
		name: req.body.name,
		comment: req.body.comment,
		email: req.body.email,
		phone: req.body.phone
	})

	//console.log(enquiry);
    let email = {
        to: 'sparc.ideas@gmail.com',
        from: `SpArc Enquiry <sparc@root-kings.com>`, //
        subject: `Enquiry: ${enquiry.comment} `,
        html: `<p>Body: ${enquiry.comment}. \
                    <br> \
                    <br>From: ${enquiry.name}  \
                    <br>Email: ${enquiry.email} \
                    <br>Phone: ${enquiry.phone} </p>`
    }

    mailer.send(email)
	//res.send('NOT IMPLEMENTED: Enquiry create POST');

	enquiry.save(function(err) {
		if (err) {
			return res.status(500).send(err)
		}

		res.render('contact', {
			status: true
		})
	})
}

// Display Enquiry delete form on GET.
exports.enquiry_delete_get = function(req, res) {
	Enquiry.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			return res.status(500).send(err)
		}
		// Success - go to author list
		res.send(true)
	})
}
