/* eslint-env node */




var fs = require('fs');
var multer = require('multer');
var path = require('path');


// -----






var Product = require('../models/product');
var productUpload = multer({
    storage: multer.memoryStorage()
}).single('product_image');

function findStaticProductImage(productId) {
    var productDir = path.join(__dirname, '..', 'www', 'catalog', 'product');
    var extensions = ['jpeg', 'jpg', 'png', 'webp'];

    for (var i = 0; i < extensions.length; i++) {
        var imagePath = path.join(productDir, productId + '.' + extensions[i]);

        if (fs.existsSync(imagePath)) {
            return imagePath;
        }
    }

    return null;
}

// Display list of all Products.
exports.product_list = function (req, res) {
    Product.find({})
        //.populate('categories')
        .exec(function (err, list_products) {
            if (err) {
                return res.render('shop', {
                    products: []
                });
            }
            //Successful, so render
            res.render('shop', {
                products: list_products
            });
            //res.send(list_products);
        });
};

exports.product_edit = function (req, res) {
    Product.find({})
        //.populate('categories')
        .exec(function (err, list_products) {
            if (err) {
                return res.render('edit-products', {
                    products: []
                });
            }
            //Successful, so render
            res.render('edit-products', {
                products: list_products
            });
            //res.send(list_products);
        });
};

// Display detail page for a specific Product.
exports.product_detail = function (req, res) {
    Product.findById(req.params.id)
        //.populate('categories')
        .exec(function (err, product) {
            if (err) {
                return res.status(500).send(err);
            }
            if (!product) {
                return res.status(404).send({
                    error: 'Product not found'
                });
            }
            //Successful, so render
            //console.log(product)
            res.send(product);
            //res.send(list_products);
        });
    //res.send('NOT IMPLEMENTED: Product detail: ' + String(req.params.id));
};


// Handle Product create on POST.
exports.product_create_post = function (req, res) {
    // Create a Book object with escaped and trimmed data.
    var product = new Product({});

    productUpload(req, res, function (err) {
        if (err) {
            return res.status(500).send(err);
            //return res.end('Error uploading file.');
        } else {
            //console.log(req.body);
            //console.log(req.file);


            product.name = req.body.product_name;
            product.description = req.body.product_description;
            product.cost = req.body.product_cost;

            if (req.file) {
                product.image.data = req.file.buffer;
                product.image.contentType = req.file.mimetype;
            }
            //console.log(product);

            product.save(function (err) {
                if (err) {
                    return res.status(500).send(err);
                }
                //successful - redirect to new book record.
                res.redirect('/dashboard/products');
            });

            //res.end("File has been uploaded");
        }
    });

    /*

    */

    //console.log(req.body);
    //res.send('request recieved for product' + product.name);
};


// Handle Product delete on POST.
exports.product_delete_post = function (req, res) {
    Product.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            return res.status(500).send(err);
        }
        // Success - go to author list
        res.redirect('/dashboard/products');
    });

    //es.send('NOT IMPLEMENTED: Product delete POST');
};


// Handle Product update on POST.
exports.product_update_post = function (req, res) {
    productUpload(req, res, function (err) {
        if (err) {
            return res.status(500).send(err);
        } else {

            var product = {
                name: req.body.product_name,
                description: req.body.product_description,
                cost: req.body.product_cost
            };

            if (req.file) {
                product.image = {
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                };
            }

            Product.findByIdAndUpdate(req.params.id, product, {}, function (err) {
                if (err) {
                    return res.status(500).send(err);
                }
                //successful - redirect to new book record.
                res.redirect('/dashboard/products');
            });

        }
    });

};




// Display detail image for a specific Enquiry.
exports.product_image_get = function (req, res) {
    Product.findById(req.params.id)
        .exec(function (err, product) {
            if (err) {
                return res.redirect('/images/blank.png');
            }

            if (!product || !product.image || !product.image.data || product.image.data.length === 0) {
                var staticImagePath = findStaticProductImage(req.params.id);

                if (staticImagePath) {
                    return res.sendFile(staticImagePath);
                }

                return res.redirect('/images/blank.png');
            }

            res.contentType(product.image.contentType || 'image/png');
            res.send(product.image.data);

            //res.send(list_products);

        });
    // res.send('NOT IMPLEMENTED: Enquiry detail: ' + req.params.id);
};
