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
exports.product_list = async function (req, res) {
    try {
        var list_products = await Product.find({});
        res.render('shop', { products: list_products });
    } catch (err) {
        res.render('shop', { products: [] });
    }
};

exports.product_edit = async function (req, res) {
    try {
        var list_products = await Product.find({});
        res.render('edit-products', { products: list_products });
    } catch (err) {
        res.render('edit-products', { products: [] });
    }
};

// Display detail page for a specific Product.
exports.product_detail = async function (req, res) {
    try {
        var product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }
        res.send(product);
    } catch (err) {
        res.status(500).send(err);
    }
};


// Handle Product create on POST.
exports.product_create_post = function (req, res) {
    var product = new Product({});

    productUpload(req, res, async function (err) {
        if (err) {
            return res.status(500).send(err);
        }

        product.name = req.body.product_name;
        product.description = req.body.product_description;
        product.cost = req.body.product_cost;

        if (req.file) {
            product.image.data = req.file.buffer;
            product.image.contentType = req.file.mimetype;
        }

        try {
            await product.save();
            res.redirect('/dashboard/products');
        } catch (saveErr) {
            res.status(500).send(saveErr);
        }
    });
};


// Handle Product delete on POST.
exports.product_delete_post = async function (req, res) {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/dashboard/products');
    } catch (err) {
        res.status(500).send(err);
    }
};


// Handle Product update on POST.
exports.product_update_post = function (req, res) {
    productUpload(req, res, async function (err) {
        if (err) {
            return res.status(500).send(err);
        }

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

        try {
            await Product.findByIdAndUpdate(req.params.id, product, {});
            res.redirect('/dashboard/products');
        } catch (updateErr) {
            res.status(500).send(updateErr);
        }
    });
};




// Display detail image for a specific Enquiry.
exports.product_image_get = async function (req, res) {
    try {
        var product = await Product.findById(req.params.id);

        if (!product || !product.image || !product.image.data || product.image.data.length === 0) {
            var staticImagePath = findStaticProductImage(req.params.id);

            if (staticImagePath) {
                return res.sendFile(staticImagePath);
            }

            return res.redirect('/images/blank.png');
        }

        res.contentType(product.image.contentType || 'image/png');
        res.send(product.image.data);
    } catch (err) {
        res.redirect('/images/blank.png');
    }
};
