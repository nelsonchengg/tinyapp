const express = require("express");
const cookieSession = require("cookie-session");
const { generateRandomString, getUserByEmail, urlsForUser } = require("./helpers");
const { urlDatabase, users } = require("./database");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"],

  maxAge: 24 * 60 * 60 * 1000
}));

app.get("/", (req, res) => {
  if (req.session["user_id"]) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  if (!req.session["user_id"]) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[req.session["user_id"]], urls: urlsForUser(req.session["user_id"], urlDatabase) };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session["user_id"]) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[req.session["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!req.session["user_id"]) {
    return res.send("You are not logged in!\n");
  }

  if (!urlDatabase[req.params.id]) {
    return res.send("ShortURL is not in the database");
  }

  if (urlDatabase[req.params.id].userID !== req.session["user_id"]) {
    return res.send("You don't own this");
  }
  const templateVars = { user: users[req.session["user_id"]], id: req.params.id, longURL: urlDatabase[req.params.id].longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.send("ShortURL is not in the database");
  }
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  if (!req.session["user_id"]) {
    return res.send("You are not logged in!\n");
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body["longURL"],
    userID: req.session["user_id"]
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  if (!req.session["user_id"]) {
    return res.send("You are not logged in!\n");
  }

  if (!urlDatabase[req.params.id]) {
    return res.send("ShortURL is not in the database");
  }

  if (urlDatabase[req.params.id].userID !== req.session["user_id"]) {
    return res.send("You don't own this");
  }
  const newURL = req.body.longURL;
  urlDatabase[req.params.id].longURL = newURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  if (!req.session["user_id"]) {
    return res.send("You are not logged in!\n");
  }

  if (!urlDatabase[req.params.id]) {
    return res.send("ShortURL is not in the database");
  }

  if (urlDatabase[req.params.id].userID !== req.session["user_id"]) {
    return res.send("You don't own this");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const userID = req.session["user_id"];
  if (userID) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[req.session["user_id"]] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(403).send("Email or Password are undefined");
  }
  const user = getUserByEmail(req.body.email, users);
  if (user) {
    return res.status(403).send("User already exists");
  }
  const userId = generateRandomString();
  users[userId] = { id: userId, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) };
  req.session["user_id"] = userId;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userID = req.session["user_id"];
  if (userID) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[req.session["user_id"]] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(403).send("Email or Password are undefined");
  }
  const user = getUserByEmail(req.body.email, users);
  if (!user) {
    return res.status(403).send("User Not Found");
  }
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(403).send("Password is incorrect");
  }
  req.session["user_id"] = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
