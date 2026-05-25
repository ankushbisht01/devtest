/* eslint-env node */

const fs = require('fs')
const path = require('path')
const multer = require('multer')

var Project = require('../models/project')

const PROJECT_IMAGE_DIR = path.join(__dirname, '..', 'www', 'catalog', 'project')
const PROJECT_IMAGE_URL_PREFIX = '/catalog/project'

function ensureProjectImageDir() {
	fs.mkdirSync(PROJECT_IMAGE_DIR, { recursive: true })
}

function safeFilePart(value) {
	return path
		.basename(value || 'project-image')
		.replace(/[^a-zA-Z0-9_.-]/g, '-')
}

function localImagePathFromName(fileName) {
	if (!fileName) return null
	return path.join(PROJECT_IMAGE_DIR, path.basename(fileName))
}

function localImagePathFromUrl(imageUrl) {
	if (typeof imageUrl !== 'string') return null
	if (imageUrl.indexOf(PROJECT_IMAGE_URL_PREFIX + '/') !== 0) return null
	return localImagePathFromName(imageUrl.split('/').slice(-1)[0])
}

function deleteLocalProjectImages(images, done) {
	if (!images || images.length === 0) return done()

	var pending = images.length
	var firstError = null

	function finish(err) {
		if (err && err.code !== 'ENOENT' && !firstError) {
			firstError = err
		}

		pending -= 1
		if (pending === 0) done(firstError)
	}

	images.forEach(function(imageUrl) {
		var imagePath = localImagePathFromUrl(imageUrl)

		if (!imagePath) return finish()

		fs.unlink(imagePath, finish)
	})
}

const projectImageStorage = multer.diskStorage({
	destination: function(req, file, cb) {
		try {
			ensureProjectImageDir()
			cb(null, PROJECT_IMAGE_DIR)
		} catch (err) {
			cb(err)
		}
	},
	filename: function(req, file, cb) {
		var originalExt = path.extname(file.originalname)
		var ext = originalExt.toLowerCase()
		var baseName = safeFilePart(path.basename(file.originalname, originalExt))
		var uniquePart = Date.now() + '-' + Math.round(Math.random() * 1e9)

		cb(null, uniquePart + '-' + baseName + ext)
	}
})

const projectImageUpload = multer({
	storage: projectImageStorage
}).single('project_image')

// Display list of all Projects.
exports.project_list = function(req, res) {
	Project.find({}).exec(function(err, list_projects) {
		if (err) {
			return res.render('gallery', {
				projects: []
			})
		}

		res.render('gallery', {
			projects: list_projects
		})
	})
}

exports.project_edit = function(req, res) {
	res.render('edit-projects')
}

exports.project_list_api = function(req, res) {
	Project.find({}).exec(function(err, list_projects) {
		if (err) {
			return res.status(500).send(err)
		}

		res.send(list_projects)
	})
}

// Display detail page for a specific Project.
exports.project_detail = function(req, res) {
	Project.findById(req.params.id).exec(function(err, project) {
		if (err) {
			return res.status(500).send(err)
		}
		if (!project) {
			return res.status(404).send({
				error: 'Project not found'
			})
		}

		res.send(project)
	})
}

// Handle Project create on POST.
exports.project_create_post = function(req, res) {
	var project = new Project(req.body)

	if (!project.images) {
		project.images = []
	}

	project.save(function(err) {
		if (err) {
			return res.status(500).send(err)
		}

		res.send(project)
	})
}

// Handle Project delete on POST.
exports.project_delete_post = function(req, res) {
	Project.findById(req.params.id, function(err, project) {
		if (err) {
			return res.status(500).send(err)
		}
		if (!project) {
			return res.status(404).send(false)
		}

		deleteLocalProjectImages(project.images, function(err) {
			if (err) {
				return res.status(500).send(err)
			}

			Project.findByIdAndRemove(req.params.id, function(err) {
				if (err) {
					return res.status(500).send(err)
				}

				return res.send(true)
			})
		})
	})
}

// Handle Project update on POST.
exports.project_update_post = function(req, res) {
	var project = Object.assign({}, req.body)

	delete project._id
	delete project.__v

	if (!Array.isArray(project.images)) {
		project.images = []
	}

	Project.findByIdAndUpdate(req.params.id, project, { new: true }, function(err, updatedProject) {
		if (err) {
			return res.status(500).send(err)
		}

		res.send(updatedProject || project)
	})
}

// Display the first image for a specific Project.
exports.project_image_get = function(req, res) {
	Project.findById(req.params.id).exec(function(err, project) {
		if (err) {
			return res.status(500).send(err)
		}
		if (!project || !project.images || !project.images[0]) {
			return res.redirect('/images/blank.png')
		}

		res.redirect(project.images[0])
	})
}

exports.project_image_upload_post = function(req, res) {
	projectImageUpload(req, res, function(err) {
		if (err) {
			return res.status(500).send(err)
		}
		if (!req.file) {
			return res.status(400).send({
				error: 'No image uploaded'
			})
		}

		var url = PROJECT_IMAGE_URL_PREFIX + '/' + req.file.filename

		res.send({
			filename: req.file.filename,
			url: url
		})
	})
}

exports.project_image_delete_get = function(req, res) {
	var imagePath = localImagePathFromName(req.query.fileName)

	if (!imagePath) {
		return res.send(false)
	}

	fs.unlink(imagePath, function(err) {
		if (err && err.code !== 'ENOENT') {
			return res.status(500).send(err)
		}

		res.send(true)
	})
}
