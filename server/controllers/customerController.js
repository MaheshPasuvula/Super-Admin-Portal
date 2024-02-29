const Customer = require("../models/Customer");
const mongoose = require("mongoose");

/**
 * GET /
 * Homepage
 */
exports.homepage = async (req, res) => {
  const messages = await req.flash("info");

  const locals = {
    title: "NodeJs",
    description: "Free NodeJs User Management System",
  };

  let perPage = 12;
  let page = req.query.page || 1;

  try {
    const customers = await Customer.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    const count = await Customer.countDocuments({});

    res.render("index", {
      locals,
      customers,
      current: page,
      pages: Math.ceil(count / perPage),
      messages,
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * GET /
 * About
 */
exports.about = async (req, res) => {
  const locals = {
    title: "About",
    description: "Free NodeJs User Management System",
  };

  try {
    res.render("about", locals);
  } catch (error) {
    console.log(error);
  }
};

/**
 * GET /
 * New Customer Form
 */
exports.addCustomer = async (req, res) => {
  const locals = {
    title: "Add New Customer - NodeJs",
    description: "Free NodeJs User Management System",
  };
  
  const customer = {}; // Define an empty customer object
  // Check if there is an error message in the flash messages
  const errorMessage = req.flash('error');
  res.render("customer/add", {
    locals,
    customer, // Pass the customer object to the view
    errorMessage: errorMessage.length ? errorMessage[0] : null // Pass the error message to the view

  });
};

/**
 * POST /
 * Create New Customer
 */
/**
 * POST /
 * Create New Customer
 */
exports.postCustomer = async (req, res) => {
  console.log(req.body);

  const { firstName, lastName, telephone, email } = req.body;
  try{
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      await req.flash("error", "Email address is already in use");
      return res.redirect("/add");
    }
   // Validate that firstName and lastName are non-empty strings without numbers
   const nameRegex = /^[a-zA-Z ]+$/; // Regex to match only letters and spaces
   if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
     await req.flash("error", "First name and last name must be non-empty strings without numbers");
     return res.redirect("/add");
   }


  // Check if email ends with '@gmail.com'
  if (!email.endsWith('@gmail.com')) {
    // If the email does not end with '@gmail.com', display an error message
    await req.flash("error", "Email address must end with @gmail.com");
    return res.redirect("/add");
  }


  if (!firstName || !lastName || !telephone || !email) {
    // If any required fields are missing, return an error response
    return res.status(400).send('All fields are required');
  }

  const newCustomer = new Customer({
    firstName,
    lastName,
    telephone,
    email,
  });

  
    await Customer.create(newCustomer);
    await req.flash("info", "New customer has been added.");

    res.redirect("/");
  } catch (error) {
    console.log(error);
    // Handle the error and send an appropriate response
    res.status(500).send('Error creating new customer');
  }
};

/**
 * GET /
 * Customer Data
 */
exports.view = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id });

    const locals = {
      title: "View Customer Data",
      description: "Free NodeJs User Management System",
    };

    res.render("customer/view", {
      locals,
      customer,
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * GET /
 * Edit Customer Data
 */
exports.edit = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id });

    const locals = {
      title: "Edit Customer Data",
      description: "Free NodeJs User Management System",
      errorMessage: req.flash('error'), // Pass the error message to the view
      customer,
    };

    res.render("customer/edit", locals);
  } catch (error) {
    console.log(error);
  }
};


/**
 * GET /
 * Update Customer Data
 */
exports.editPost = async (req, res) => {
  try {
    const { firstName, lastName, telephone, email } = req.body;
    // Check if email ends with '@gmail.com'
    if (!email.endsWith('@gmail.com')) {
      // If the email does not end with '@gmail.com', display an error message
      await req.flash("error", "Email address must end with @gmail.com");
      return res.redirect(`/edit/${req.params.id}`);
    }

    // Check if the email is unique
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer && existingCustomer._id.toString() !== req.params.id) {
      // If the email already exists for another customer, display an error message
      await req.flash("error", "Email address is already in use");
      return res.redirect(`/edit/${req.params.id}`);
    }

    await Customer.findByIdAndUpdate(req.params.id, {
      firstName,
      lastName,
      telephone,
      email,
      updatedAt: Date.now(),
    });

    await res.redirect("/");
    console.log("redirected to home page");
  } catch (error) {
    console.log(error);
  }
};

/**
 * Delete /
 * Delete Customer Data
 */
exports.deleteCustomer = async (req, res) => {
  try {
    await Customer.deleteOne({ _id: req.params.id });
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

/**
 * Get /
 * Search Customer Data
 */
exports.searchCustomers = async (req, res) => {
  const locals = {
    title: "Search Customer Data",
    description: "Free NodeJs User Management System",
  };

  try {
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

    const customers = await Customer.find({
      $or: [
        { firstName: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        { lastName: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    });

    res.render("search", {
      customers,
      locals,
    });
  } catch (error) {
    console.log(error);
  }
};
