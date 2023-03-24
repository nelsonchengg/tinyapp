const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const getUserByEmail = function(email) {
  for (const id in users) {
    if (email === users[id]["email"]) {
      return users[id];
    }
  }
  return null;
};

const urlsForUser = function(id) {
  const result = {};
  for (const shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL]["userID"]) {
      result[shortURL] = urlDatabase[shortURL]["longURL"];
    }
  }
  return result;
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[req.cookies["user_id"]], urls: urlsForUser(req.cookies["user_id"]) };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.send("You are not logged in!\n");
  }

  if (!urlDatabase[req.params.id]) {
    return res.send("ShortURL is not in the database");
  }

  if (!urlsForUser(req.cookies["user_id"])[req.params.id]) {
    return res.send("You don't own this");
  }
  const templateVars = { user: users[req.cookies["user_id"]], id: req.params.id, longURL: urlDatabase[req.params.id].longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id].longURL) {
    return res.send("ShortURL is not in the database");
  }
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.send("You are not logged in!\n");
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body["longURL"],
    userID: req.cookies["user_id"]
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.send("You are not logged in!\n");
  }

  if (!urlDatabase[req.params.id]) {
    return res.send("ShortURL is not in the database");
  }

  if (!urlsForUser(req.cookies["user_id"])[req.params.id]) {
    return res.send("You don't own this");
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.send("You are not logged in!\n");
  }

  if (!urlDatabase[req.params.id]) {
    return res.send("ShortURL is not in the database");
  }

  if (!urlsForUser(req.cookies["user_id"])[req.params.id]) {
    return res.send("You don't own this");
  }
  const newURL = req.body.longURL;
  urlDatabase[req.params.id].longURL = newURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(403).send("Email or Password are undefined");
  }
  const user = getUserByEmail(req.body.email);
  if (!user) {
    return res.status(403).send("User Not Found");
  }
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(403).send("Password is incorrect");
  }
  res.cookie("user_id", user.id).redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id").redirect('/login');
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(403).send("Email or Password are undefined");
  }
  const user = getUserByEmail(req.body.email);
  if (user) {
    return res.status(403).send("User already exists");
  }
  const userId = generateRandomString();
  users[userId] = { id: userId, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) };
  res.cookie("user_id", userId).redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
