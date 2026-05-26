var Person = require("../models/person");

//Show all Persons
exports.person_list = async function(req, res) {
  try {
    var list_Person = await Person.find({});
    res.send(list_Person);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.about_get = async function(req, res) {
  try {
    var list_Person = await Person.find({});
    res.render("about", { people: list_Person });
  } catch (err) {
    res.render("about", { people: [] });
  }
};

//
exports.person_create = async function(req, res) {
  var person = new Person({
    name: req.body.name,
    comments: req.body.comments,
    position: req.body.position,
    education: req.body.education
  });

  try {
    await person.save();
    res.send(person);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.person_delete_all_get = async (req, res) => {
  try {
    var result = await Person.deleteMany({});
    if (result) return res.send(result);
    return res.send(false);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.person_delete_post = async (req, res) => {
  try {
    await Person.findByIdAndDelete(req.params.id);
    res.redirect("/dashboard/person/create");
  } catch (err) {
    res.status(500).send(err);
  }
};
